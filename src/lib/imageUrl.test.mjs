import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { optimizedImage } from './imageUrl.js';

const BASE = 'https://res.cloudinary.com/demo/image/upload';

describe('optimizedImage', () => {
  test('asks Cloudinary for a right-sized, modern-format copy of its own images', () => {
    assert.equal(
      optimizedImage(`${BASE}/v1790/elaff-products/rice.jpg`, 600),
      `${BASE}/f_auto,q_auto,c_limit,w_600/v1790/elaff-products/rice.jpg`
    );
  });

  test('leaves an image alone that already has a transformation', () => {
    const url = `${BASE}/w_100,h_100,c_fill/v1790/rice.jpg`;
    assert.equal(optimizedImage(url, 600), url);
  });

  test('leaves other hosts, local files, videos, blanks and non-strings alone', () => {
    const untouched = [
      'https://images.unsplash.com/photo-1?q=80&w=300',
      '/logo.png',
      'https://res.cloudinary.com/demo/video/upload/v1/clip.mp4',
      '',
      undefined,
      null,
    ];
    for (const value of untouched) assert.equal(optimizedImage(value, 600), value);
  });

  test('refuses a nonsense width instead of building a broken URL', () => {
    const url = `${BASE}/v1/rice.jpg`;
    for (const width of [0, -5, NaN, undefined, 'wide']) assert.equal(optimizedImage(url, width), url, String(width));
  });
});
