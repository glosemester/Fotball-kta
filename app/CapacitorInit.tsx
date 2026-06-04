"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard } from "@capacitor/keyboard";

export default function CapacitorInit() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // 11. Status bar - riktig farge og stil
      StatusBar.setBackgroundColor({ color: "#000000" }).catch(console.error);
      StatusBar.setStyle({ style: Style.Dark }).catch(console.error);

      // 15. Skjul tastatur ved trykk utenfor input
      Keyboard.addListener('keyboardDidShow', () => {
        const handleTouchEnd = () => {
          Keyboard.hide();
          document.removeEventListener('touchend', handleTouchEnd);
        };
        document.addEventListener('touchend', handleTouchEnd, { once: true });
      });

      // 17. Haptic feedback ved viktige handlinger (Global)
      const handleGlobalClick = async (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isClickable = target.closest('button') || target.closest('a');
        if (isClickable) {
          try {
            await import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
              Haptics.impact({ style: ImpactStyle.Light });
            });
          } catch (err) {}
        }
      };
      document.addEventListener('click', handleGlobalClick);

      return () => {
        document.removeEventListener('click', handleGlobalClick);
      };
    }
  }, []);

  return null;
}
