'use client';

import dynamic from 'next/dynamic';
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ForwardRefExoticComponent,
  type MutableRefObject
} from 'react';
import type { RefAttributes } from 'react';
import type { APITypes, PlyrProps } from 'plyr-react';
import 'plyr-react/plyr.css';

type PlyrComponent = ForwardRefExoticComponent<PlyrProps & RefAttributes<APITypes>>;

const Plyr = dynamic(async () => import('plyr-react'), {
  ssr: false
}) as PlyrComponent;

const StablePlyr = memo(
  ({ handleRef, source, options }: { handleRef: (api: APITypes | null) => void; source: PlyrProps['source']; options: PlyrProps['options'] }) => (
    <Plyr ref={handleRef} source={source} options={options} />
  ),
  () => true
);

export type TimedUpsellPlayerProps = {
  src: string;
  poster?: string;
  title?: string;
  unlockAtSecond: number;
  onUnlock: () => void;
  className?: string;
  aspectRatio?: `${number} / ${number}`;
};

export function TimedUpsellPlayer({
  src,
  poster,
  title,
  unlockAtSecond,
  onUnlock,
  className,
  aspectRatio = '16 / 9'
}: TimedUpsellPlayerProps) {
  const playerRef: MutableRefObject<APITypes | null> = useRef<APITypes | null>(null);
  const hasUnlockedRef = useRef<boolean>(false);
  const listenerAttachedRef = useRef<boolean>(false);
  const onUnlockRef = useRef(onUnlock);
  const unlockAtSecondRef = useRef(unlockAtSecond);

  // Atualizar refs quando props mudam
  useEffect(() => {
    onUnlockRef.current = onUnlock;
    unlockAtSecondRef.current = unlockAtSecond;
    hasUnlockedRef.current = false;
  }, [onUnlock, unlockAtSecond]);

  useEffect(() => {
    // Retry até o player estar pronto
    const attachListener = () => {
      if (!playerRef.current) {
        setTimeout(attachListener, 100);
        return;
      }

      const plyrInstance = playerRef.current.plyr;

      if (typeof plyrInstance.on !== 'function') {
        setTimeout(attachListener, 100);
        return;
      }

      if (listenerAttachedRef.current) {
        return;
      }

      listenerAttachedRef.current = true;

      const handleTimeUpdate = (event: CustomEvent) => {
        const instance = event.detail.plyr;
        const currentTime = instance.currentTime;

        if (!hasUnlockedRef.current && currentTime >= unlockAtSecondRef.current) {
          hasUnlockedRef.current = true;
          onUnlockRef.current();
        }
      };

      plyrInstance.on('timeupdate', handleTimeUpdate);

      return () => {
        plyrInstance.off('timeupdate', handleTimeUpdate);
      };
    };

    const cleanup = attachListener();
    return cleanup;
  }, []);

  const handleRef = useCallback((api: APITypes | null) => {
    playerRef.current = api;
  }, []);

  const source: PlyrProps['source'] = useMemo(() => ({
    type: 'video',
    ...(title ? { title } : {}),
    ...(poster ? { poster } : {}),
    sources: [
      {
        src,
        type: 'video/mp4'
      }
    ]
  }), [src, title, poster]);

  const options: PlyrProps['options'] = useMemo(
    () => ({
      controls: ['play-large', 'progress'],
      tooltips: { controls: true, seek: true },
      clickToPlay: true,
      autoplay: false,
      autopause: false,
      hideControlsOnPause: true
    }),
    []
  );

  return (
    <div>
      <div className={`relative z-0 w-full overflow-hidden ${className ?? ''}`} style={{ aspectRatio }}>
        <StablePlyr handleRef={handleRef} source={source} options={options} />
      </div>
    </div>
  );
}

const areEqual = (
  prev: TimedUpsellPlayerProps,
  next: TimedUpsellPlayerProps
) =>
  prev.src === next.src &&
  prev.title === next.title &&
  prev.poster === next.poster &&
  prev.unlockAtSecond === next.unlockAtSecond &&
  prev.aspectRatio === next.aspectRatio &&
  prev.className === next.className;

export default memo(TimedUpsellPlayer, areEqual);
