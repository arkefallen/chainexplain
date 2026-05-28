import { describe, it, expect, beforeEach } from 'vitest';
import useJobStore from '../../store/useJobStore';
import { JOB_STATUS } from '../../constants/jobStatus';

describe('useJobStore Zustand store', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useJobStore.getState().reset();
  });

  it('should initialize with correct default state', () => {
    const state = useJobStore.getState();

    expect(state.currentJobId).toBeNull();
    expect(state.jobStatus).toBe(JOB_STATUS.IDLE);
    expect(state.progress).toBe(0);
    expect(state.summaryId).toBeNull();
    expect(state.summaryEn).toBeNull();
    expect(state.chunks).toEqual([]);
    expect(state.activeLang).toBe('id');
    expect(state.error).toBeNull();
    expect(state.uploadedFile).toBeNull();
    expect(state.projectName).toBeNull();
  });

  it('should handle startUpload action', () => {
    // Set some error first to test if startUpload clears it
    useJobStore.setState({ error: 'Some error' });

    useJobStore.getState().startUpload();
    const state = useJobStore.getState();

    expect(state.jobStatus).toBe(JOB_STATUS.UPLOADING);
    expect(state.error).toBeNull();
  });

  it('should handle setJobId action', () => {
    useJobStore.getState().setJobId('job-1234');
    const state = useJobStore.getState();

    expect(state.currentJobId).toBe('job-1234');
    expect(state.jobStatus).toBe(JOB_STATUS.PENDING);
  });

  it('should handle updateFromFirestore action', () => {
    const payload = {
      status: JOB_STATUS.PROCESSING,
      progress: 60,
      summaryId: 'Mock Indonesian summary',
      summaryEn: 'Mock English summary',
      projectName: 'Solana Protocol',
      chunks: [{ index: 1, summaryId: 'a', summaryEn: 'b' }],
      error: null
    };

    useJobStore.getState().updateFromFirestore(payload);
    const state = useJobStore.getState();

    expect(state.jobStatus).toBe(JOB_STATUS.PROCESSING);
    expect(state.progress).toBe(60);
    expect(state.summaryId).toBe('Mock Indonesian summary');
    expect(state.summaryEn).toBe('Mock English summary');
    expect(state.projectName).toBe('Solana Protocol');
    expect(state.chunks).toEqual(payload.chunks);
    expect(state.error).toBeNull();
  });

  it('should toggle activeLang between id and en', () => {
    const store = useJobStore.getState();

    expect(store.activeLang).toBe('id');
    
    useJobStore.getState().toggleLang();
    expect(useJobStore.getState().activeLang).toBe('en');

    useJobStore.getState().toggleLang();
    expect(useJobStore.getState().activeLang).toBe('id');
  });

  it('should toggle theme and persist to localStorage', () => {
    // Force initial state
    useJobStore.setState({ theme: 'dark' });

    useJobStore.getState().toggleTheme();
    expect(useJobStore.getState().theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');

    useJobStore.getState().toggleTheme();
    expect(useJobStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should handle setError action', () => {
    useJobStore.getState().setError('Firestore denied access');
    const state = useJobStore.getState();

    expect(state.jobStatus).toBe(JOB_STATUS.FAILED);
    expect(state.error).toBe('Firestore denied access');
  });

  it('should reset state to initial state completely', () => {
    useJobStore.setState({
      currentJobId: 'job-xyz',
      jobStatus: JOB_STATUS.COMPLETED,
      progress: 100,
      summaryId: 'text',
      uploadedFile: new File([], 'wp.pdf'),
      projectName: 'Aave'
    });

    useJobStore.getState().reset();
    const state = useJobStore.getState();

    expect(state.currentJobId).toBeNull();
    expect(state.jobStatus).toBe(JOB_STATUS.IDLE);
    expect(state.progress).toBe(0);
    expect(state.summaryId).toBeNull();
    expect(state.projectName).toBeNull();
  });
});
