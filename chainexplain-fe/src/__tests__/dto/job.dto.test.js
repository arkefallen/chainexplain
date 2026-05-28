import { describe, it, expect } from 'vitest';
import { jobDto, formatSummaryToMarkdown } from '../../dto/job.dto';
import { JOB_STATUS } from '../../constants/jobStatus';

describe('formatSummaryToMarkdown', () => {
  it('should return empty string if input is falsy', () => {
    expect(formatSummaryToMarkdown(null)).toBe('');
    expect(formatSummaryToMarkdown(undefined)).toBe('');
    expect(formatSummaryToMarkdown('')).toBe('');
  });

  it('should return the string as is if input is a string', () => {
    const text = 'This is plain markdown text';
    expect(formatSummaryToMarkdown(text)).toBe(text);
  });

  it('should format structured summary object into markdown', () => {
    const structuredSummary = {
      project_name: 'Solana',
      project_vision: 'To build a scalable, high-performance blockchain.',
      overall_summary: 'Solana is extremely fast and uses Proof of History.',
      chapters: [
        {
          title: 'Proof of History',
          points: [
            'A cryptographic clock that orders events',
            'Enables ultra-fast block times'
          ]
        },
        {
          title: 'Tower BFT',
          points: [
            'A custom PBFT-like consensus mechanism'
          ]
        }
      ]
    };

    const result = formatSummaryToMarkdown(structuredSummary);
    
    expect(result).toContain('**Visi Proyek**: To build a scalable, high-performance blockchain.');
    expect(result).toContain('Solana is extremely fast and uses Proof of History.');
  });

  it('should handle missing fields in structured summary gracefully', () => {
    const incompleteSummary = {
      overall_summary: 'Just an overall summary without vision or chapters'
    };
    
    const result = formatSummaryToMarkdown(incompleteSummary);
    expect(result).toBe('Just an overall summary without vision or chapters');
  });
});

describe('jobDto mappers', () => {
  describe('mapUploadResponse', () => {
    it('should map standard upload response correctly', () => {
      const apiResponse = {
        data: {
          jobId: 'job-123',
          status: 'PENDING',
          fileName: 'whitepaper.pdf'
        }
      };

      const result = jobDto.mapUploadResponse(apiResponse);

      expect(result).toEqual({
        jobId: 'job-123',
        status: JOB_STATUS.PENDING,
        fileName: 'whitepaper.pdf'
      });
    });

    it('should handle unnested responses and apply defaults', () => {
      const flatResponse = {
        id: 'job-456'
      };

      const result = jobDto.mapUploadResponse(flatResponse);

      expect(result).toEqual({
        jobId: 'job-456',
        status: JOB_STATUS.PENDING,
        fileName: ''
      });
    });
  });

  describe('mapJobStatusResponse', () => {
    it('should map complete job status response from API', () => {
      const apiResponse = {
        data: {
          id: 'job-123',
          status: 'COMPLETED',
          progress: 100,
          project_name: 'Solana Project',
          fileName: 'solana.pdf',
          createdAt: '2026-05-26T12:00:00Z',
          summaryId: {
            project_vision: 'High-speed blockchain',
            overall_summary: 'Fast network',
            chapters: [{ title: 'Intro', points: ['Point 1'] }]
          },
          summaryEn: 'English plain markdown text',
          chunks: [
            {
              index: 1,
              summaryId: 'Chunk Indonesian text',
              summaryEn: {
                project_vision: 'Chunk vision',
                overall_summary: 'Chunk summary',
                chapters: []
              }
            }
          ],
          error: null
        }
      };

      const result = jobDto.mapJobStatusResponse(apiResponse);

      expect(result.id).toBe('job-123');
      expect(result.status).toBe(JOB_STATUS.COMPLETED);
      expect(result.progress).toBe(100);
      expect(result.projectName).toBe('Solana Project');
      expect(result.fileName).toBe('solana.pdf');
      expect(result.createdAt).toBe('2026-05-26T12:00:00Z');
      expect(result.summaryId).toContain('**Visi Proyek**: High-speed blockchain');
      expect(result.summaryEn).toBe('English plain markdown text');
      
      expect(result.chaptersId).toHaveLength(1);
      expect(result.chaptersId[0].title).toBe('Intro');
      expect(result.chaptersEn).toHaveLength(0);
      
      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0].index).toBe(1);
      expect(result.chunks[0].summaryId).toBe('Chunk Indonesian text');
      expect(result.chunks[0].summaryEn).toContain('**Visi Proyek**: Chunk vision');
    });
  });

  describe('mapFirestoreSnapshot', () => {
    it('should map firestore document snapshot data correctly', () => {
      const docData = {
        status: 'PROCESSING',
        progress: 45,
        project_name: 'Bitcoin Core',
        summaryId: 'Mock summary ID text',
        summaryEn: {
          project_vision: 'Decentralized cash',
          overall_summary: 'Peer-to-peer electronic cash system',
          chapters: []
        },
        chunks: [
          {
            summaryId: 'Indonesian chunk text',
            summaryEn: 'English chunk text'
          }
        ],
        error: null
      };

      const result = jobDto.mapFirestoreSnapshot(docData);

      expect(result.status).toBe(JOB_STATUS.PROCESSING);
      expect(result.progress).toBe(45);
      expect(result.projectName).toBe('Bitcoin Core');
      expect(result.summaryId).toBe('Mock summary ID text');
      expect(result.summaryEn).toContain('**Visi Proyek**: Decentralized cash');
      
      expect(result.chaptersId).toHaveLength(0);
      expect(result.chaptersEn).toHaveLength(0);
      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0].index).toBe(1); // Auto-indexed
      expect(result.chunks[0].summaryId).toBe('Indonesian chunk text');
    });

    it('should return null if snapshot data is empty', () => {
      expect(jobDto.mapFirestoreSnapshot(null)).toBeNull();
      expect(jobDto.mapFirestoreSnapshot(undefined)).toBeNull();
    });
  });
});
