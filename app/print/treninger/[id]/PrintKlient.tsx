"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrintKlient({ fallbackUrl }: { fallbackUrl: string }) {
  const router = useRouter();

  useEffect(() => {
    // Sørg for at alt er lastet inn før vi printer
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    // Når brukeren lukker print-dialogen, sendes de tilbake
    const handleAfterPrint = () => {
      router.push(fallbackUrl);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [router, fallbackUrl]);

  return null;
}
