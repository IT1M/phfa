/**
 * Integration Redux Slice
 * إدارة حالة التكاملات في التطبيق
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { integrationAPI, IntegrationResponse, MOHPatientData, HISPatientRecord, LISTestResult, PharmacyOrder } from '@/lib/integration-api';

interface IntegrationState {
  // MOH Data
  mohPatient: MOHPatientData | null;
  mohLoading: boolean;
  mohError: string | null;

  // HIS Data
  hisPatient: HISPatientRecord | null;
  activeAdmissions: HISPatientRecord[];
  hisLoading: boolean;
  hisError: string | null;

  // LIS Data
  labTests: LISTestResult[];
  pendingTests: LISTestResult[];
  lisLoading: boolean;
  lisError: string | null;

  // Pharmacy Data
  prescriptions: PharmacyOrder[];
  drugInteractions: any | null;
  pharmacyLoading: boolean;
  pharmacyError: string | null;

  // Webhooks
  webhooks: any[];
  webhooksLoading: boolean;
  webhooksError: string | null;

  // Connection Status
  connectionStatus: Record<string, boolean>;
  testingConnections: boolean;
}

const initialState: IntegrationState = {
  mohPatient: null,
  mohLoading: false,
  mohError: null,

  hisPatient: null,
  activeAdmissions: [],
  hisLoading: false,
  hisError: null,

  labTests: [],
  pendingTests: [],
  lisLoading: false,
  lisError: null,

  prescriptions: [],
  drugInteractions: null,
  pharmacyLoading: false,
  pharmacyError: null,

  webhooks: [],
  webhooksLoading: false,
  webhooksError: null,

  connectionStatus: {},
  testingConnections: false,
};

// ==================== MOH Actions ====================

export const fetchMOHPatient = createAsyncThunk(
  'integration/fetchMOHPatient',
  async (nationalId: string) => {
    const response = await integrationAPI.getMOHPatient(nationalId);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

export const verifyInsurance = createAsyncThunk(
  'integration/verifyInsurance',
  async ({ nationalId, insuranceNumber }: { nationalId: string; insuranceNumber: string }) => {
    const response = await integrationAPI.verifyInsurance(nationalId, insuranceNumber);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

// ==================== HIS Actions ====================

export const fetchHISPatient = createAsyncThunk(
  'integration/fetchHISPatient',
  async (patientId: string) => {
    const response = await integrationAPI.getHISPatient(patientId);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

export const fetchActiveAdmissions = createAsyncThunk(
  'integration/fetchActiveAdmissions',
  async (department?: string) => {
    const response = await integrationAPI.getActiveAdmissions(department);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

export const createAdmission = createAsyncThunk(
  'integration/createAdmission',
  async (data: any) => {
    const response = await integrationAPI.createAdmission(data);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

// ==================== LIS Actions ====================

export const orderLabTest = createAsyncThunk(
  'integration/orderLabTest',
  async (data: any) => {
    const response = await integrationAPI.orderLabTest(data);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

export const fetchLabResults = createAsyncThunk(
  'integration/fetchLabResults',
  async (testId: string) => {
    const response = await integrationAPI.getLabResults(testId);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

export const fetchPendingTests = createAsyncThunk(
  'integration/fetchPendingTests',
  async () => {
    const response = await integrationAPI.getPendingTests();
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

// ==================== Pharmacy Actions ====================

export const createPrescription = createAsyncThunk(
  'integration/createPrescription',
  async (data: any) => {
    const response = await integrationAPI.createPrescription(data);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

export const checkDrugInteractions = createAsyncThunk(
  'integration/checkDrugInteractions',
  async (medications: string[]) => {
    const response = await integrationAPI.checkDrugInteractions(medications);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

export const fetchPatientMedications = createAsyncThunk(
  'integration/fetchPatientMedications',
  async (patientId: string) => {
    const response = await integrationAPI.getPatientMedications(patientId);
    if (!response.success) throw new Error(response.error);
    return response.data;
  }
);

// ==================== Webhook Actions ====================

export const fetchWebhooks = createAsyncThunk(
  'integration/fetchWebhooks',
  async () => {
    const response = await integrationAPI.listWebhooks();
    if (!response.success) throw new Error('Failed to fetch webhooks');
    return response.webhooks;
  }
);

export const registerWebhook = createAsyncThunk(
  'integration/registerWebhook',
  async (config: any) => {
    const response = await integrationAPI.registerWebhook(config);
    if (!response.success) throw new Error('Failed to register webhook');
    return response.webhookId;
  }
);

// ==================== Connection Test ====================

export const testConnections = createAsyncThunk(
  'integration/testConnections',
  async () => {
    const response = await integrationAPI.testConnections();
    if (!response.success) throw new Error('Failed to test connections');
    return response.results;
  }
);

// ==================== Slice ====================

const integrationSlice = createSlice({
  name: 'integration',
  initialState,
  reducers: {
    clearMOHData: (state) => {
      state.mohPatient = null;
      state.mohError = null;
    },
    clearHISData: (state) => {
      state.hisPatient = null;
      state.activeAdmissions = [];
      state.hisError = null;
    },
    clearLISData: (state) => {
      state.labTests = [];
      state.pendingTests = [];
      state.lisError = null;
    },
    clearPharmacyData: (state) => {
      state.prescriptions = [];
      state.drugInteractions = null;
      state.pharmacyError = null;
    },
  },
  extraReducers: (builder) => {
    // MOH
    builder
      .addCase(fetchMOHPatient.pending, (state) => {
        state.mohLoading = true;
        state.mohError = null;
      })
      .addCase(fetchMOHPatient.fulfilled, (state, action) => {
        state.mohLoading = false;
        state.mohPatient = action.payload;
      })
      .addCase(fetchMOHPatient.rejected, (state, action) => {
        state.mohLoading = false;
        state.mohError = action.error.message || 'فشل في جلب بيانات المريض';
      });

    // HIS
    builder
      .addCase(fetchHISPatient.pending, (state) => {
        state.hisLoading = true;
        state.hisError = null;
      })
      .addCase(fetchHISPatient.fulfilled, (state, action) => {
        state.hisLoading = false;
        state.hisPatient = action.payload;
      })
      .addCase(fetchHISPatient.rejected, (state, action) => {
        state.hisLoading = false;
        state.hisError = action.error.message || 'فشل في جلب سجل المريض';
      })
      .addCase(fetchActiveAdmissions.fulfilled, (state, action) => {
        state.activeAdmissions = action.payload;
      });

    // LIS
    builder
      .addCase(fetchPendingTests.pending, (state) => {
        state.lisLoading = true;
        state.lisError = null;
      })
      .addCase(fetchPendingTests.fulfilled, (state, action) => {
        state.lisLoading = false;
        state.pendingTests = action.payload;
      })
      .addCase(fetchPendingTests.rejected, (state, action) => {
        state.lisLoading = false;
        state.lisError = action.error.message || 'فشل في جلب الفحوصات';
      })
      .addCase(orderLabTest.fulfilled, (state, action) => {
        state.labTests.push(action.payload);
      });

    // Pharmacy
    builder
      .addCase(fetchPatientMedications.pending, (state) => {
        state.pharmacyLoading = true;
        state.pharmacyError = null;
      })
      .addCase(fetchPatientMedications.fulfilled, (state, action) => {
        state.pharmacyLoading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPatientMedications.rejected, (state, action) => {
        state.pharmacyLoading = false;
        state.pharmacyError = action.error.message || 'فشل في جلب الأدوية';
      })
      .addCase(checkDrugInteractions.fulfilled, (state, action) => {
        state.drugInteractions = action.payload;
      });

    // Webhooks
    builder
      .addCase(fetchWebhooks.pending, (state) => {
        state.webhooksLoading = true;
        state.webhooksError = null;
      })
      .addCase(fetchWebhooks.fulfilled, (state, action) => {
        state.webhooksLoading = false;
        state.webhooks = action.payload;
      })
      .addCase(fetchWebhooks.rejected, (state, action) => {
        state.webhooksLoading = false;
        state.webhooksError = action.error.message || 'فشل في جلب Webhooks';
      });

    // Connection Test
    builder
      .addCase(testConnections.pending, (state) => {
        state.testingConnections = true;
      })
      .addCase(testConnections.fulfilled, (state, action) => {
        state.testingConnections = false;
        state.connectionStatus = action.payload;
      })
      .addCase(testConnections.rejected, (state) => {
        state.testingConnections = false;
      });
  },
});

export const { clearMOHData, clearHISData, clearLISData, clearPharmacyData } = integrationSlice.actions;
export default integrationSlice.reducer;
