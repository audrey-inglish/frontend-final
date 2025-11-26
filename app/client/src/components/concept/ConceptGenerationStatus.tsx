// import { SpinnerIcon } from '../icons';
// import type { ConceptGenerationStatus } from '../../contexts';

// interface ConceptGenerationStatusProps {
//   status: ConceptGenerationStatus;
// }

// export function ConceptGenerationStatusIndicator({ status }: ConceptGenerationStatusProps) {
//   if (status === 'generating') {
//     return (
//       <div className="flex items-center gap-2 text-sm text-primary-600">
//         <SpinnerIcon className="w-4 h-4 animate-spin" />
//         <span>Generating concepts...</span>
//       </div>
//     );
//   }

//   if (status === 'stale') {
//     return (
//       <div className="flex items-center gap-2 text-sm text-amber-600">
//         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//         </svg>
//         <span>Updating concepts...</span>
//       </div>
//     );
//   }

//   if (status === 'ready') {
//     return (
//       <div className="flex items-center gap-2 text-sm text-green-600">
//         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//         </svg>
//         <span>Up to date</span>
//       </div>
//     );
//   }

//   return null;
// }
