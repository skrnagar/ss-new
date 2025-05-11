
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <div className="relative w-full h-[90vh]">
          <Image
            src={imageUrl}
            alt="Full screen view"
            fill
            className="object-contain"
            quality={100}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
