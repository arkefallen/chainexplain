const logger = require('../../shared/utils/logger');

const MAX_CHUNK_SIZE = 8000;
const OVERLAP_SIZE = 500;

const chunkText = (text) => {
  logger.info('Starting recursive text chunking');
  
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks = [];
  let currentIndex = 0;
  
  while (currentIndex < text.length) {
    let endIndex = currentIndex + MAX_CHUNK_SIZE;
    
    if (endIndex >= text.length) {
      chunks.push(text.slice(currentIndex));
      break;
    }
    
    // Try to find a good breaking point (paragraph > sentence > word)
    let breakingPoint = findBreakingPoint(text, currentIndex, endIndex);
    
    if (breakingPoint === -1) {
      // If no good breaking point, just cut at MAX_CHUNK_SIZE
      breakingPoint = endIndex;
    }
    
    chunks.push(text.slice(currentIndex, breakingPoint));
    
    // Move to next chunk, accounting for overlap
    currentIndex = breakingPoint - OVERLAP_SIZE;
    
    // Prevent infinite loop if overlap is larger than chunk progress
    if (currentIndex <= chunks.length * (MAX_CHUNK_SIZE - OVERLAP_SIZE - 1000)) {
        currentIndex = breakingPoint; // fallback if overlap causing stagnation
    }
  }

  logger.info(`Generated ${chunks.length} chunks`);
  return chunks;
};

const findBreakingPoint = (text, start, end) => {
  const searchArea = text.slice(start, end);
  
  // 1. Look for double newline (paragraph break) in the last 1000 chars
  const lastDoubleNewline = searchArea.lastIndexOf('\n\n');
  if (lastDoubleNewline > searchArea.length - 1000) {
    return start + lastDoubleNewline + 2;
  }
  
  // 2. Look for single newline
  const lastNewline = searchArea.lastIndexOf('\n');
  if (lastNewline > searchArea.length - 1000) {
    return start + lastNewline + 1;
  }
  
  // 3. Look for sentence end (.!?)
  const sentenceEndMatches = [...searchArea.matchAll(/[.!?]\s/g)];
  if (sentenceEndMatches.length > 0) {
    const lastSentenceEnd = sentenceEndMatches[sentenceEndMatches.length - 1].index;
    if (lastSentenceEnd > searchArea.length - 1000) {
      return start + lastSentenceEnd + 2;
    }
  }
  
  // 4. Look for word boundary (space)
  const lastSpace = searchArea.lastIndexOf(' ');
  if (lastSpace > searchArea.length - 500) {
    return start + lastSpace + 1;
  }
  
  return -1;
};

module.exports = { chunkText };
