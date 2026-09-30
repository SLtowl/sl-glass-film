import React from 'react';
import {Composition} from 'remotion';
import {Film} from './film/Film';
import {FPS} from './kit/tokens';
import {SIZE, TOTAL} from './kit/timeline';

/** Size and length come from script.py (WIDTH, HEIGHT, DURATION) via src/timeline.json. */
export const Root: React.FC = () => <Composition id="Film" component={Film} durationInFrames={TOTAL} fps={FPS} width={SIZE.width} height={SIZE.height} />;
