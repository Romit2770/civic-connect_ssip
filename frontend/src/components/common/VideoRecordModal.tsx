import React from 'react';
import CameraCaptureModal from './CameraCaptureModal';
import { EvidenceRecord } from '../../utils/evidenceValidator';

interface VideoRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (record: EvidenceRecord) => void;
  category?: string;
  subcategory?: string;
}

export default function VideoRecordModal(props: VideoRecordModalProps) {
  return <CameraCaptureModal {...props} initialMode="video" />;
}
