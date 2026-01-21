export type SupportedInputType = 'pdf' | 'doc' | 'docs' | 'txt' | 'html' | 'url';


export const EXTENSION_MAP: Record<string, SupportedInputType> = {
  pdf: 'pdf',
  doc: 'doc',
  docs: 'docs',
  txt: 'txt',
  html: 'html',
  htm: 'html',
};

const MIME_TYPE_MAP: Record<string, SupportedInputType> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docs',
  'text/plain': 'txt',
  'text/html': 'html',
};

const jobMatchSessions = new Map<
  string,
  {
    jobDescription: string;
    matches: any[];
    uploadedJobIds: string[];
  }
>();

export const normalizeDecision = (input: string): 'yes' | 'no' | null => {
  const normalized = input.trim().toLowerCase();
  if (normalized === 'yes' || normalized === 'y') {
    return 'yes';
  }
  if (normalized === 'no' || normalized === 'n') {
    return 'no';
  }
  return null;
};

export const extractMatchScore = (match: any): number | null => {
  const rawScore =
    match?.similarity ??
    match?.score ??
    match?.match_score ??
    match?.match_rate ??
    match?.similarity_score ??
    null;
  if (typeof rawScore !== 'number' || Number.isNaN(rawScore)) {
    return null;
  }
  const normalized = rawScore <= 1 ? rawScore * 100 : rawScore;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};


export const formatMatchSummary = (matches: any[]): { summary: string; topRate: number | null } => {
  if (!Array.isArray(matches) || matches.length === 0) {
    return {
      summary: 'No matching resumes were found for the uploaded job description.',
      topRate: null,
    };
  }

  const topMatches = matches.slice(0, 5).map((match, index) => {
    const name =
      match?.name ??
      match?.candidate_name ??
      match?.title ??
      match?.id ??
      `Candidate ${index + 1}`;
    const score = extractMatchScore(match);
    return score === null ? `- ${name}` : `- ${name}: ${score}% match`;
  });

  const topRate = extractMatchScore(matches[0]);
  return {
    summary: `Top matches:\n${topMatches.join('\n')}`,
    topRate,
  };
};

export const extractTextFromDataUrl = (dataUrl: string): string | null => {
  if (!dataUrl.startsWith('data:')) {
    return null;
  }
  const [meta, data] = dataUrl.split(',');
  if (!meta || data == null) {
    return null;
  }
  const isBase64 = meta.includes(';base64');
  try {
    return isBase64 ? Buffer.from(data, 'base64').toString('utf8') : decodeURIComponent(data);
  } catch (error) {
    console.warn('[CHAT] Failed to decode data URL text:', error);
    return null;
  }
};


export const isHttpUrl = (value: string): boolean => {
  return value.startsWith('http://') || value.startsWith('https://');
};

export const extractFirstUrl = (text: string): string | null => {
  const match = text.match(/https?:\/\/\S+/i);
  return match ? match[0] : null;
};

export const extractUserQuery = (message: any): string => {
  if (!message) {
    return '';
  }
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part: any) => part?.type === 'text')
      .map((part: any) => (typeof part.text === 'string' ? part.text : ''))
      .join(' ')
      .trim();
  }
  if (typeof message.content === 'string') {
    return message.content.trim();
  }
  if (typeof message.text === 'string') {
    return message.text.trim();
  }
  return '';
};


export const getMessageAttachments = (message: any): any[] => {
  const files = Array.isArray(message?.files) ? message.files : [];
  const experimental = Array.isArray(message?.experimental_attachments)
    ? message.experimental_attachments
    : [];
  return [...files, ...experimental];
};

export const getFileExtension = (filename: string): string | null => {
  const match = filename.trim().toLowerCase().match(/\.([a-z0-9]+)$/i);
  return match ? match[1] : null;
};

export const parseDataUrlMimeType = (dataUrl: string): string | null => {
  if (!dataUrl.startsWith('data:')) {
    return null;
  }
  const [meta] = dataUrl.split(',');
  if (!meta) {
    return null;
  }
  const mimeType = meta.slice(5).split(';')[0];
  return mimeType || null;
};

export const resolveInputType = (file: any): SupportedInputType | 'file' | null => {
  const url = typeof file?.url === 'string' ? file.url : '';
  
  // Check if it's a URL
  if (url && isHttpUrl(url)) {
    return 'url';
  }
  
  // Check if it has a filename (indicating a file)
  const filename = file?.filename || file?.name || '';
  if (filename) {
    return 'file';
  }
  
  return null;
};

export const extractBase64FromDataUrl = (dataUrl: string): string | null => {
  if (!dataUrl.startsWith('data:')) {
    return null;
  }
  const [meta, data] = dataUrl.split(',');
  if (!meta || data == null) {
    return null;
  }
  if (!meta.includes(';base64')) {
    return null;
  }
  return data;
};

export const getFilename = (file: any): string => {
  if (typeof file?.filename === 'string' && file.filename.trim()) {
    return file.filename.trim();
  }
  if (typeof file?.name === 'string' && file.name.trim()) {
    return file.name.trim();
  }
  const url = typeof file?.url === 'string' ? file.url : '';
  if (url && isHttpUrl(url)) {
    const pathname = new URL(url).pathname;
    const derived = pathname.split('/').pop();
    if (derived) {
      return derived;
    }
  }
  return '';
};