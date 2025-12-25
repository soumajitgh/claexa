import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex'; // Changed back to rehype-katex
import remarkGfm from 'remark-gfm'; // Import GFM
import rehypeRaw from 'rehype-raw'; // Import rehype-raw

export const sharedRemarkPlugins = [remarkGfm, remarkMath];
// Add rehypeRaw before rehypeSanitize for security
export const sharedRehypePlugins = [rehypeKatex, rehypeRaw]; // Changed back to rehypeKatex
