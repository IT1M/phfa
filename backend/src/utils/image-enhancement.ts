import sharp from 'sharp';
import cv from 'opencv4nodejs';
import path from 'path';
import fs from 'fs/promises';

export class ImageEnhancementService {
  
  /**
   * Comprehensive image enhancement pipeline for medical documents
   */
  async enhanceForOCR(inputPath: string, outputPath?: string): Promise<string> {
    const enhancedPath = outputPath || this.generateEnhancedPath(inputPath);
    
    try {
      // Load image with OpenCV for advanced processing
      const image = await cv.imreadAsync(inputPath);
      
      // Apply enhancement pipeline
      let enhanced = image;
      
      // 1. Noise reduction
      enhanced = await this.reduceNoise(enhanced);
      
      // 2. Contrast enhancement
      enhanced = await this.enhanceContrast(enhanced);
      
      // 3. Deskewing
      enhanced = await this.deskewImage(enhanced);
      
      // 4. Binarization
      enhanced = await this.binarizeImage(enhanced);
      
      // 5. Morphological operations
      enhanced = await this.applyMorphology(enhanced);
      
      // Save enhanced image
      await cv.imwriteAsync(enhancedPath, enhanced);
      
      // Additional Sharp processing for fine-tuning
      await this.finalSharpProcessing(enhancedPath);
      
      return enhancedPath;
      
    } catch (error) {
      console.error('Image enhancement failed:', error);
      // Fallback to basic Sharp enhancement
      return await this.basicSharpEnhancement(inputPath, enhancedPath);
    }
  }

  /**
   * Reduce noise in the image
   */
  private async reduceNoise(image: cv.Mat): Promise<cv.Mat> {
    // Apply Gaussian blur to reduce noise
    const blurred = image.gaussianBlur(new cv.Size(3, 3), 0);
    
    // Apply bilateral filter for edge-preserving smoothing
    const filtered = blurred.bilateralFilter(9, 75, 75);
    
    return filtered;
  }

  /**
   * Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
   */
  private async enhanceContrast(image: cv.Mat): Promise<cv.Mat> {
    // Convert to grayscale if not already
    const gray = image.channels === 1 ? image : image.cvtColor(cv.COLOR_BGR2GRAY);
    
    // Apply CLAHE
    const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
    const enhanced = clahe.apply(gray);
    
    return enhanced;
  }

  /**
   * Detect and correct skew in the document
   */
  private async deskewImage(image: cv.Mat): Promise<cv.Mat> {
    try {
      // Convert to binary for line detection
      const binary = image.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)[1];
      
      // Detect lines using HoughLines
      const lines = binary.houghLinesP(1, Math.PI / 180, 100, 100, 10);
      
      if (lines.length === 0) return image;
      
      // Calculate average angle
      let totalAngle = 0;
      let validLines = 0;
      
      for (const line of lines) {
        const angle = Math.atan2(line.w - line.y, line.z - line.x) * 180 / Math.PI;
        if (Math.abs(angle) < 45) { // Only consider reasonable angles
          totalAngle += angle;
          validLines++;
        }
      }
      
      if (validLines === 0) return image;
      
      const avgAngle = totalAngle / validLines;
      
      // Rotate image to correct skew
      if (Math.abs(avgAngle) > 0.5) {
        const center = new cv.Point2(image.cols / 2, image.rows / 2);
        const rotationMatrix = cv.getRotationMatrix2D(center, avgAngle, 1.0);
        const rotated = image.warpAffine(rotationMatrix, new cv.Size(image.cols, image.rows));
        return rotated;
      }
      
      return image;
      
    } catch (error) {
      console.warn('Deskewing failed, returning original image:', error);
      return image;
    }
  }

  /**
   * Apply optimal binarization
   */
  private async binarizeImage(image: cv.Mat): Promise<cv.Mat> {
    // Ensure grayscale
    const gray = image.channels === 1 ? image : image.cvtColor(cv.COLOR_BGR2GRAY);
    
    // Try multiple binarization methods and choose the best
    const methods = [
      () => gray.threshold(0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)[1],
      () => gray.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2),
      () => gray.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 11, 2)
    ];
    
    let bestResult = null;
    let bestScore = 0;
    
    for (const method of methods) {
      try {
        const result = method();
        const score = this.evaluateBinarization(result);
        
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
        }
      } catch (error) {
        console.warn('Binarization method failed:', error);
      }
    }
    
    return bestResult || gray.threshold(127, 255, cv.THRESH_BINARY)[1];
  }

  /**
   * Apply morphological operations to clean up the binary image
   */
  private async applyMorphology(image: cv.Mat): Promise<cv.Mat> {
    // Create morphological kernels
    const kernel1 = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
    const kernel2 = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
    
    // Remove small noise
    let cleaned = image.morphologyEx(kernel1, cv.MORPH_OPEN);
    
    // Fill small gaps
    cleaned = cleaned.morphologyEx(kernel2, cv.MORPH_CLOSE);
    
    return cleaned;
  }

  /**
   * Final processing with Sharp for optimization
   */
  private async finalSharpProcessing(imagePath: string): Promise<void> {
    await sharp(imagePath)
      .sharpen(1, 1, 0.5) // Mild sharpening
      .normalize() // Normalize contrast
      .png({ quality: 100, compressionLevel: 0 }) // Lossless PNG
      .toFile(imagePath + '.tmp');
    
    // Replace original with processed version
    await fs.rename(imagePath + '.tmp', imagePath);
  }

  /**
   * Fallback basic enhancement using Sharp only
   */
  private async basicSharpEnhancement(inputPath: string, outputPath: string): Promise<string> {
    await sharp(inputPath)
      .grayscale()
      .normalize()
      .sharpen(2, 1, 0.5)
      .threshold(128)
      .png()
      .toFile(outputPath);
    
    return outputPath;
  }

  /**
   * Evaluate binarization quality
   */
  private evaluateBinarization(binary: cv.Mat): number {
    // Calculate the ratio of black to white pixels
    const totalPixels = binary.rows * binary.cols;
    const whitePixels = cv.countNonZero(binary);
    const blackPixels = totalPixels - whitePixels;
    
    const ratio = Math.min(blackPixels, whitePixels) / Math.max(blackPixels, whitePixels);
    
    // Good binarization should have a reasonable balance
    // Score based on how close the ratio is to an ideal range (0.1 to 0.4)
    if (ratio >= 0.1 && ratio <= 0.4) {
      return 1.0;
    } else if (ratio >= 0.05 && ratio <= 0.6) {
      return 0.7;
    } else {
      return 0.3;
    }
  }

  /**
   * Enhance handwritten documents specifically
   */
  async enhanceHandwritten(inputPath: string, outputPath?: string): Promise<string> {
    const enhancedPath = outputPath || this.generateEnhancedPath(inputPath, 'handwritten');
    
    await sharp(inputPath)
      .grayscale()
      .normalize()
      .sharpen(3, 2, 1) // More aggressive sharpening for handwriting
      .linear(1.2, -20) // Increase contrast
      .threshold(140) // Higher threshold for handwriting
      .png()
      .toFile(enhancedPath);
    
    return enhancedPath;
  }

  /**
   * Enhance form documents with field detection
   */
  async enhanceForm(inputPath: string, outputPath?: string): Promise<string> {
    const enhancedPath = outputPath || this.generateEnhancedPath(inputPath, 'form');
    
    try {
      const image = await cv.imreadAsync(inputPath);
      const gray = image.cvtColor(cv.COLOR_BGR2GRAY);
      
      // Detect form lines and boxes
      const edges = gray.canny(50, 150);
      const lines = edges.houghLinesP(1, Math.PI / 180, 50, 50, 10);
      
      // Create mask for form structure
      const mask = new cv.Mat(gray.rows, gray.cols, cv.CV_8UC1, new cv.Vec3(0));
      
      // Draw detected lines on mask
      for (const line of lines) {
        mask.drawLine(
          new cv.Point2(line.x, line.y),
          new cv.Point2(line.z, line.w),
          new cv.Vec3(255),
          2
        );
      }
      
      // Enhance text areas while preserving form structure
      const enhanced = gray.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
      
      // Combine with form structure
      const result = cv.bitwise_or(enhanced, mask);
      
      await cv.imwriteAsync(enhancedPath, result);
      
      return enhancedPath;
      
    } catch (error) {
      console.error('Form enhancement failed, using basic enhancement:', error);
      return await this.basicSharpEnhancement(inputPath, enhancedPath);
    }
  }

  /**
   * Enhance Arabic text specifically
   */
  async enhanceArabicText(inputPath: string, outputPath?: string): Promise<string> {
    const enhancedPath = outputPath || this.generateEnhancedPath(inputPath, 'arabic');
    
    await sharp(inputPath)
      .grayscale()
      .normalize()
      .sharpen(1.5, 1, 0.3) // Gentle sharpening for Arabic script
      .linear(1.1, -10) // Slight contrast boost
      .threshold(120) // Lower threshold for Arabic text
      .png()
      .toFile(enhancedPath);
    
    return enhancedPath;
  }

  /**
   * Batch enhance multiple images
   */
  async batchEnhance(inputPaths: string[], enhancementType: 'general' | 'handwritten' | 'form' | 'arabic' = 'general'): Promise<string[]> {
    const enhancedPaths = [];
    
    for (const inputPath of inputPaths) {
      try {
        let enhancedPath;
        
        switch (enhancementType) {
          case 'handwritten':
            enhancedPath = await this.enhanceHandwritten(inputPath);
            break;
          case 'form':
            enhancedPath = await this.enhanceForm(inputPath);
            break;
          case 'arabic':
            enhancedPath = await this.enhanceArabicText(inputPath);
            break;
          default:
            enhancedPath = await this.enhanceForOCR(inputPath);
        }
        
        enhancedPaths.push(enhancedPath);
        
      } catch (error) {
        console.error(`Failed to enhance ${inputPath}:`, error);
        enhancedPaths.push(inputPath); // Use original if enhancement fails
      }
    }
    
    return enhancedPaths;
  }

  /**
   * Generate enhanced file path
   */
  private generateEnhancedPath(inputPath: string, type: string = 'enhanced'): string {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));
    const ext = path.extname(inputPath);
    
    return path.join(dir, `${name}_${type}_${Date.now()}${ext}`);
  }

  /**
   * Analyze image quality before enhancement
   */
  async analyzeImageQuality(imagePath: string): Promise<{
    resolution: { width: number; height: number };
    dpi: number;
    colorSpace: string;
    fileSize: number;
    estimatedTextClarity: number;
    recommendedEnhancement: string;
  }> {
    try {
      const metadata = await sharp(imagePath).metadata();
      const stats = await fs.stat(imagePath);
      
      // Estimate DPI (default to 72 if not available)
      const dpi = metadata.density || 72;
      
      // Analyze image for text clarity estimation
      const image = await cv.imreadAsync(imagePath);
      const gray = image.channels === 1 ? image : image.cvtColor(cv.COLOR_BGR2GRAY);
      
      // Calculate variance of Laplacian (measure of blur)
      const laplacian = gray.laplacian(cv.CV_64F);
      const variance = laplacian.variance();
      
      // Estimate text clarity based on variance
      const estimatedTextClarity = Math.min(1.0, variance.val / 1000);
      
      // Recommend enhancement type
      let recommendedEnhancement = 'general';
      if (dpi < 150) {
        recommendedEnhancement = 'form'; // Low DPI might be a form
      } else if (estimatedTextClarity < 0.3) {
        recommendedEnhancement = 'handwritten'; // Low clarity might be handwritten
      }
      
      return {
        resolution: {
          width: metadata.width || 0,
          height: metadata.height || 0
        },
        dpi,
        colorSpace: metadata.space || 'unknown',
        fileSize: stats.size,
        estimatedTextClarity,
        recommendedEnhancement
      };
      
    } catch (error) {
      console.error('Image quality analysis failed:', error);
      return {
        resolution: { width: 0, height: 0 },
        dpi: 72,
        colorSpace: 'unknown',
        fileSize: 0,
        estimatedTextClarity: 0.5,
        recommendedEnhancement: 'general'
      };
    }
  }
}