import React from 'react';
import {ease, pop} from '../kit/tokens';
import {Badge, Bars, Button, Check, Odometer, Slider, Tabs, Toggle} from '../kit/ui';
import {TileFn} from '../kit/tiles';
import {CardCtx} from '../blocks/Assemble';

/*
 * Product-specific content of the example film (SL UI Library - a UI component library).
 * Everything here is replaced for another product; the blocks and the kit stay.
 */

/** Hero tiles: the product's own world. For a UI library that is live UI components. */
export const TILES: TileFn[] = [
  (t, k) => <Toggle on={Math.floor(t * 1.4 + k) % 2} s={0.8} />,
  (t, k) => <Slider v={0.5 + 0.38 * Math.sin(t * 2.4 + k)} />,
  () => <Button />,
  (t, k) => <Check on={Math.floor(t * 1.2 + k) % 2 === 0} />,
  (t, k) => <Tabs i={Math.floor(t * 1.8 + k) % 3} />,
  () => <Badge />,
  (t) => <Bars t={t} />,
];

/** The slow manual way, typed in the Pressure block's left pane. */
export const WORK = {
  title: 'button.css - hand-written',
  lines: [
    '.btn {',
    '  display: flex;',
    '  align-items: centre;',
    '  justify-content: middle;',
    '  padding: 13px 41px 12px 40px;',
    '  border-radius: 7px 9px 7px 8px;',
    '  background: linear-gradient(#55f, ???);',
    '  box-shadow: 0 0 0 1px #000, 0 9px 3px red;',
    '  z-index: 999999;',
    '  position: absolute; left: 49.7%;',
    '  transform: translate(-50%, -48%);',
    '  font: bold 17.5px/1.1 "Arial Black";',
    '  margin-left: -3px; /* why */',
    '  !important;',
    '}',
  ],
  bad: /centre|middle|\?\?\?|!important/,
};

/** Its broken result: a hand-made button cycling through broken states every 7 frames. */
export const BrokenButton: React.FC<{local: number}> = ({local}) => {
  const state = Math.floor(Math.max(0, local) / 7) % 4; // drawn a few frames early during transitions → clamp
  const b = [
    {dx: 38, dy: -14, rot: -4, pad: '12px 44px', r: 6, text: 'Get  started'},
    {dx: -52, dy: 22, rot: 3, pad: '30px 18px', r: 30, text: 'Get started'},
    {dx: 12, dy: 40, rot: -9, pad: '8px 70px', r: 0, text: 'GET STARTED!!'},
    {dx: -20, dy: -30, rot: 6, pad: '20px 26px', r: 14, text: 'get Started'},
  ][state];
  return (
    <div
      style={{
        padding: b.pad,
        borderRadius: b.r,
        background: 'linear-gradient(90deg, #5555ff, #b0b0b0)',
        boxShadow: '0 9px 3px rgba(255,0,0,0.5)',
        fontFamily: 'Arial Black, sans-serif',
        fontSize: 30,
        color: '#fff',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        transform: `translate(${b.dx}px, ${b.dy}px) rotate(${b.rot}deg)`,
      }}
    >
      {b.text}
    </div>
  );
};

/** The result the product builds: pricing plans whose prices roll when the toggle flips. */
export const PLANS = [
  {name: 'Starter', a: '$9', b: '$90'},
  {name: 'Pro', a: '$29', b: '$290', badge: 'POPULAR'},
  {name: 'Team', a: '$79', b: '$790'},
];

export const planCard = (i: number, {at, flip, frame}: CardCtx) => {
  const pl = PLANS[i];
  return (
    <>
      <div style={{marginTop: 22}}>
        <Odometer from={pl.a.padEnd(pl.b.length, ' ')} to={pl.b} p={flip} size={76} />
      </div>
      {[0.85, 0.7, 0.78].map((w, k) => (
        <div key={k} style={{height: 12, width: `${w * 100 * ease(frame, at + 8 + k * 2, at + 16 + k * 2)}%`, borderRadius: 6, background: 'rgba(14,16,32,0.08)', marginTop: k ? 14 : 30}} />
      ))}
      <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'center'}}>
        <ButtonPop at={at + 10} frame={frame} />
      </div>
    </>
  );
};

const ButtonPop: React.FC<{at: number; frame: number}> = ({at, frame}) => (
  <div style={{transform: `scale(${pop(frame, at, 11, 200)})`}}>
    <Button />
  </div>
);
