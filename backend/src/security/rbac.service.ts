import { Pool } from 'pg';

export enum Role {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  GUEST = 'guest'
}

export enum Permission {
  // Patient permissions
  VIEW_PATIENT = 'view_patient',
  CREATE_PATIENT = 'create_patient',
  UPDATE_PATIENT = 'update_patient',
  DELETE_PATIENT = 'delete_patient',
  
  // Document permissions
  VIEW_DOCUMENT = 'view_document',
  UPLOAD_DOCUMENT = 'upload_document',
  UPDATE_DOCUMENT = 'update_document',
  DELETE_DOCUMENT = 'delete_document',
  DOWNLOAD_DOCUMENT = 'download_document',
  
  // Medical record permissions
  VIEW_MEDICAL_RECORD = 'view_medical_record',
  CREATE_MEDICAL_RECORD = 'create_medical_record',
  UPDATE_MEDICAL_RECORD = 'update_medical_record',
  
  // Admin permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SYSTEM = 'manage_system',
  EXPORT_DATA = 'export_data',
  
  // Security permissions
  MANAGE_SECURITY = 'manage_security',
  VIEW_SECURITY_LOGS = 'view_security_logs'
}

/**
 * Role-Based Access Control Service
 */
export class RBACService {
  private pool: Pool;
  
  // Role-Permission mapping
  private rolePermissions: Map<Role, Set<Permission>> = new Map([
    [Role.ADMIN, new Set([
      Permission.VIEW_PATIENT, Permission.CREATE_PATIENT, Permission.UPDATE_PATIENT, Permission.DELETE_PATIENT,
      Permission.VIEW_DOCUMENT, Permission.UPLOAD_DOCUMENT, Permission.UPDATE_DOCUMENT, Permission.DELETE_DOCUMENT, Permission.DOWNLOAD_DOCUMENT,
      Permission.VIEW_MEDICAL_RECORD, Permission.CREATE_MEDICAL_RECORD, Permission.UPDATE_MEDICAL_RECORD,
      Permission.MANAGE_USERS, Permission.MANAGE_ROLES, Permission.VIEW_AUDIT_LOGS, Permission.MANAGE_SYSTEM, Permission.EXPORT_DATA,
      Permission.MANAGE_SECURITY, Permission.VIEW_SECURITY_LOGS
    ])],
    [Role.DOCTOR, new Set([
      Permission.VIEW_PATIENT, Permission.CREATE_PATIENT, Permission.UPDATE_PATIENT,
      Permission.VIEW_DOCUMENT, Permission.UPLOAD_DOCUMENT, Permission.UPDATE_DOCUMENT, Permission.DOWNLOAD_DOCUMENT,
      Permission.VIEW_MEDICAL_RECORD, Permission.CREATE_MEDICAL_RECORD, Permission.UPDATE_MEDICAL_RECORD
    ])],
    [Role.NURSE, new Set([
      Permission.VIEW_PATIENT, Permission.UPDATE_PATIENT,
      Permission.VIEW_DOCUMENT, Permission.UPLOAD_DOCUMENT, Permission.DOWNLOAD_DOCUMENT,
      Permission.VIEW_MEDICAL_RECORD, Permission.CREATE_MEDICAL_RECORD
    ])],
    [Role.GUEST, new Set([
      Permission.VIEW_PATIENT,
      Permission.VIEW_DOCUMENT
    ])]
  ]);

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Check if user has permission
   */
  hasPermission(role: Role, permission: Permission): boolean {
    const permissions = this.rolePermissions.get(role);
    return permissions ? permissions.has(permission) : false;
  }

  /**
   * Check if user has any of the permissions
   */
  hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(role, permission));
  }

  /**
   * Check if user has all permissions
   */
  hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(role, permission));
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: Role): Permission[] {
    const permissions = this.rolePermissions.get(role);
    return permissions ? Array.from(permissions) : [];
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: number, role: Role): Promise<void> {
    await this.pool.query(
      `UPDATE users SET role = $1 WHERE id = $2`,
      [role, userId]
    );
  }

  /**
   * Get user role
   */
  async getUserRole(userId: number): Promise<Role | null> {
    const result = await this.pool.query(
      `SELECT role FROM users WHERE id = $1`,
      [userId]
    );
    
    return result.rows.length > 0 ? result.rows[0].role : null;
  }

  /**
   * Check resource ownership
   */
  async isResourceOwner(userId: number, resourceType: string, resourceId: number): Promise<boolean> {
    let query = '';
    
    switch (resourceType) {
      case 'patient':
        query = `SELECT 1 FROM patients WHERE id = $1 AND created_by = $2`;
        break;
      case 'document':
        query = `SELECT 1 FROM documents WHERE id = $1 AND uploaded_by = $2`;
        break;
      default:
        return false;
    }

    const result = await this.pool.query(query, [resourceId, userId]);
    return result.rows.length > 0;
  }

  /**
   * Check if user can access patient data
   */
  async canAccessPatient(userId: number, patientId: number): Promise<boolean> {
    const role = await this.getUserRole(userId);
    
    if (!role) return false;
    
    // Admins and doctors can access all patients
    if (role === Role.ADMIN || role === Role.DOCTOR) {
      return true;
    }
    
    // Nurses can access assigned patients
    if (role === Role.NURSE) {
      const result = await this.pool.query(
        `SELECT 1 FROM patient_assignments WHERE patient_id = $1 AND user_id = $2`,
        [patientId, userId]
      );
      return result.rows.length > 0;
    }
    
    // Guests can only view their own data
    if (role === Role.GUEST) {
      const result = await this.pool.query(
        `SELECT 1 FROM patients WHERE id = $1 AND user_id = $2`,
        [patientId, userId]
      );
      return result.rows.length > 0;
    }
    
    return false;
  }
}
