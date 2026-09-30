import React from 'react';
import {useCurrentFrame} from 'remotion';
import {scenes} from './timeline';
import {Burst, Dissolve, GlassWipe, MatchCut, PushCard, Shockwave, Whip, WINDOW} from './transitions';

/*
 * Edit assembly: scenes by id + the cut used to enter each scene.
 *
 *   <Edit views={{hook: Hook, reveal: Reveal, ...}} cuts={{reveal: 'Burst', problem: 'MatchCut', ...}} />
 *
 * A scene without an entry in `cuts` starts with a hard cut - avoid that; every change of scene is a transition
 * in this style, and no two neighbouring cuts should be the same type.
 */
export type CutType = 'Burst' | 'MatchCut' | 'Shockwave' | 'PushCard' | 'Whip' | 'GlassWipe' | 'Dissolve' | 'None';
export type CutSpec = CutType | {type: CutType; cx?: number; cy?: number};

const windowOf = (type: CutType): readonly [number, number] => (type === 'None' ? [0, 0] : WINDOW[type]);

export const Edit: React.FC<{views: Record<string, React.FC>; cuts: Record<string, CutSpec>}> = ({views, cuts}) => {
  const frame = useCurrentFrame();
  const S = scenes();
  for (let k = 1; k < S.length; k++) {
    const spec = cuts[S[k].id] ?? 'None';
    const {type, cx, cy} = typeof spec === 'string' ? {type: spec, cx: undefined, cy: undefined} : spec;
    const [a, b] = windowOf(type);
    const at = S[k].from;
    if (type !== 'None' && frame >= at + a && frame < at + b) {
      const A = views[S[k - 1].id];
      const B = views[S[k].id];
      switch (type) {
        case 'Burst':
          return <Burst at={at} A={A} B={B} />;
        case 'MatchCut':
          return <MatchCut at={at} A={A} B={B} />;
        case 'Shockwave':
          return <Shockwave at={at} A={A} B={B} cx={cx} cy={cy} />;
        case 'PushCard':
          return <PushCard at={at} A={A} B={B} />;
        case 'Whip':
          return <Whip at={at} A={A} B={B} />;
        case 'GlassWipe':
          return <GlassWipe at={at} A={A} B={B} />;
        case 'Dissolve':
          return <Dissolve at={at} A={A} B={B} />;
      }
    }
  }
  const idx = Math.max(0, S.findIndex((s) => frame >= s.from && frame < s.to));
  const View = views[S[idx].id];
  if (!View) throw new Error(`no view for scene "${S[idx].id}"`);
  return <View />;
};

/** The sound that belongs to each cut type (placed relative to the cut frame). */
export const cutSfx = (cuts: Record<string, CutSpec>) =>
  scenes()
    .slice(1)
    .flatMap((s) => {
      const spec = cuts[s.id] ?? 'None';
      const type = typeof spec === 'string' ? spec : spec.type;
      const at = s.from;
      switch (type) {
        case 'Burst':
          return [{at: at - 8, name: 'whoosh', vol: 0.3}, {at, name: 'pop_lo', vol: 0.55}, {at: at + 2, name: 'sparkle', vol: 0.3}];
        case 'MatchCut':
          return [{at: at - 8, name: 'whoosh', vol: 0.3}];
        case 'Shockwave':
          return [{at: at - 6, name: 'whoosh', vol: 0.35}, {at: at - 2, name: 'pop_lo', vol: 0.45}];
        case 'PushCard':
          return [{at: at - 10, name: 'whoosh', vol: 0.3}];
        case 'Whip':
          return [{at: at - 8, name: 'whoosh', vol: 0.35}];
        case 'GlassWipe':
          return [{at: at - 10, name: 'swish', vol: 0.3}, {at: at - 6, name: 'whoosh', vol: 0.25}];
        case 'Dissolve':
          return [{at: at - 8, name: 'swish', vol: 0.2}];
        default:
          return [];
      }
    });
