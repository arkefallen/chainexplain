import { create } from 'zustand';
import { JOB_STATUS } from '../constants/jobStatus';

/**
 * Zustand global store to manage cryptocurrency whitepaper processing states,
 * user selections, theme toggles, and dynamic bilingual summary text.
 */
const useJobStore = create((set) => ({
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  
  /** @type {string|null} - Current active Job UUID */
  currentJobId: null,
  
  /** @type {string} - Current pipeline status: IDLE, UPLOADING, PENDING, PROCESSING, EXTRACTING, CHUNKING, SUMMARIZING, COMPLETED, FAILED */
  jobStatus: JOB_STATUS.IDLE,
  
  /** @type {number} - Pipeline progress percentage (0 - 100) */
  progress: 0,
  
  /** @type {string|null} - Structured ELI5 Summary in Indonesian (markdown format) */
  summaryId: null,
  
  /** @type {string|null} - Structured ELI5 Summary in English (markdown format) */
  summaryEn: null,
  
  /** @type {Array<Object>} - Detailed Chapters in Indonesian */
  chaptersId: [],
  
  /** @type {Array<Object>} - Detailed Chapters in English */
  chaptersEn: [],
  
  /** @type {Array<Object>} - Sub-sections/chunks extracted and summarized dynamically */
  chunks: [],
  
  /** @type {string} - Active language selection: 'id' or 'en' */
  activeLang: 'id',
  
  /** @type {string|null} - Error message detail if job fails */
  error: null,
  
  /** @type {File|null} - Local document File instance uploaded by the user */
  uploadedFile: null,
  
  /** @type {string|null} - Name of the project/protocol detected by AI (e.g. 'Bitcoin') */
  projectName: null,
  
  /** @type {string} - Active visual theme selection: 'dark' or 'light' */
  theme: localStorage.getItem('theme') || 'dark',

  // ==========================================
  // ACTION DEFINITIONS
  // ==========================================
  
  /** Toggles between 'dark' and 'light' modes and persists choice in localStorage */
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),

  /** 
   * Sets local uploaded file instance
   * @param {File} file - File object
   */
  setUploadedFile: (file) => set({ uploadedFile: file }),

  /** Marks the start of a document upload cycle and clears previous errors */
  startUpload: () => set({ jobStatus: JOB_STATUS.UPLOADING, error: null }),

  /** 
   * Associates the store with an active Job UUID and sets initial status
   * @param {string} id - Job ID
   */
  setJobId: (id) => set({ currentJobId: id, jobStatus: JOB_STATUS.PENDING }),

  /** Toggles active summary text language between Indonesian ('id') and English ('en') */
  toggleLang: () => set((state) => ({ activeLang: state.activeLang === 'id' ? 'en' : 'id' })),

  /** 
   * Explicitly sets active language selection
   * @param {string} lang - 'id' or 'en'
   */
  setLang: (lang) => set({ activeLang: lang }),

  /** 
   * Updates job processing state with raw/DTO data received from Firestore or REST polling
   * @param {Object} data - Mapped status payload
   */
  updateFromFirestore: (data) => set((state) => ({
    jobStatus: data?.status || JOB_STATUS.PROCESSING,
    progress: typeof data?.progress === 'number' ? data.progress : state.progress,
    summaryId: data?.summaryId !== undefined ? data.summaryId : state.summaryId,
    summaryEn: data?.summaryEn !== undefined ? data.summaryEn : state.summaryEn,
    projectName: data?.projectName !== undefined ? data.projectName : state.projectName,
    chunks: data?.chunks !== undefined ? data.chunks : state.chunks,
    chaptersId: data?.chaptersId !== undefined ? data.chaptersId : state.chaptersId,
    chaptersEn: data?.chaptersEn !== undefined ? data.chaptersEn : state.chaptersEn,
    error: data?.error !== undefined ? data.error : state.error
  })),

  /** 
   * Puts the store into failure state and records message detail
   * @param {string} errorMsg - User-friendly error message
   */
  setError: (errorMsg) => set({ jobStatus: JOB_STATUS.FAILED, error: errorMsg }),

  /** Resets the entire job transaction workflow back to defaults (keeps theme) */
  reset: () => set({
    currentJobId: null,
    jobStatus: JOB_STATUS.IDLE,
    progress: 0,
    summaryId: null,
    summaryEn: null,
    chaptersId: [],
    chaptersEn: [],
    chunks: [],
    activeLang: 'id',
    error: null,
    uploadedFile: null,
    projectName: null
  })
}));

export default useJobStore;
