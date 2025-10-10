import { pool } from '../config/database';

export class FHIRService {
  async createPatientResource(patientData: any) {
    const fhirResource = {
      resourceType: 'Patient',
      id: patientData.id,
      identifier: [
        {
          system: 'urn:oid:1.2.840.114350',
          value: patientData.patient_id,
        },
      ],
      name: [
        {
          use: 'official',
          text: patientData.patient_name,
        },
      ],
      gender: patientData.gender?.toLowerCase(),
      birthDate: patientData.date_of_birth,
    };

    return fhirResource;
  }

  async createDocumentReference(documentData: any) {
    const fhirResource = {
      resourceType: 'DocumentReference',
      id: documentData.id,
      status: 'current',
      type: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '34133-9',
            display: 'Summary of episode note',
          },
        ],
      },
      subject: {
        reference: `Patient/${documentData.patient_id}`,
      },
      date: documentData.created_at,
      content: [
        {
          attachment: {
            contentType: documentData.mime_type,
            url: documentData.file_path,
            title: documentData.file_name,
          },
        },
      ],
    };

    await pool.query(
      `UPDATE documents SET fhir_resource = $1 WHERE id = $2`,
      [JSON.stringify(fhirResource), documentData.id]
    );

    return fhirResource;
  }
}
