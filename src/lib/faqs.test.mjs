import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { siteFaqs, productFaqs } from './faqs.js';

const questions = (list) => list.map((item) => item.question);

describe('siteFaqs', () => {
  test('every page gets a non-empty list of real question/answer pairs', () => {
    for (const page of ['home', 'about', 'contact']) {
      const list = siteFaqs(page, {});
      assert.ok(list.length >= 3, `${page}: ${list.length} questions`);
      for (const { question, answer } of list) {
        assert.ok(question.trim().endsWith('?'), `${page}: "${question}" is not a question`);
        assert.ok(answer.trim().length > 20, `${page}: answer to "${question}" is too short`);
      }
    }
  });

  test('no page repeats a question', () => {
    for (const page of ['home', 'about', 'contact']) {
      const list = questions(siteFaqs(page, {}));
      assert.equal(new Set(list).size, list.length, page);
    }
  });

  test('the About page carries the fullest set', () => {
    assert.ok(siteFaqs('about', {}).length >= siteFaqs('home', {}).length);
    assert.ok(siteFaqs('about', {}).length >= siteFaqs('contact', {}).length);
  });

  test('the location question appears only when an address is stored, and quotes it', () => {
    const without = questions(siteFaqs('contact', {}));
    const withAddress = siteFaqs('contact', { address: 'Building 5, Market Road\nYiwu City' });
    assert.equal(withAddress.length, without.length + 1);
    const location = withAddress.find((item) => !without.includes(item.question));
    assert.match(location.answer, /Building 5, Market Road, Yiwu City/);
  });

  test('an unknown page gets no questions rather than an error', () => {
    assert.deepEqual(siteFaqs('nowhere', {}), []);
  });
});

describe('productFaqs', () => {
  const product = { title: 'Frozen Mangoes' };

  test('a product with no buyer-facing data gets no questions', () => {
    assert.deepEqual(productFaqs(product, {}), []);
    assert.deepEqual(productFaqs({ ...product, moq: '  ', leadTime: '' }, undefined), []);
  });

  test('minimum order and lead time become questions that name the product and quote the stored value', () => {
    const list = productFaqs({ ...product, moq: '500-1000 ctns', leadTime: '7-14 days' }, {});
    assert.equal(list.length, 2);
    assert.ok(list.every((item) => item.question.includes('Frozen Mangoes')));
    assert.ok(list.some((item) => item.answer.includes('500-1000 ctns')));
    assert.ok(list.some((item) => item.answer.includes('7-14 days')));
  });

  test('packaging comes from the product specification that mentions it', () => {
    const list = productFaqs({ ...product, specifications: [{ label: 'Origin', value: 'Egypt' }, { label: 'Packaging', value: '10kg cartons' }] }, {});
    assert.equal(list.length, 1);
    assert.match(list[0].answer, /10kg cartons/);
    assert.ok(!list[0].answer.includes('Egypt'));
  });

  test('shipping rows are listed together in one answer', () => {
    const list = productFaqs({ ...product, shippingInfo: [{ label: 'FOB Port', value: 'Shanghai' }, { label: 'Incoterm', value: 'FOB' }] }, {});
    assert.equal(list.length, 1);
    assert.match(list[0].answer, /FOB Port: Shanghai/);
    assert.match(list[0].answer, /Incoterm: FOB/);
  });

  test('company-wide facts (payment terms, certifications) are not repeated on every product', () => {
    const list = productFaqs(product, {
      paymentInfo: [{ label: 'Accepted Methods', value: 'T/T, L/C' }],
      certifications: [{ name: 'HACCP' }, { name: 'Halal' }],
    });
    assert.deepEqual(list, []);
  });

  test('blank rows are ignored', () => {
    assert.deepEqual(productFaqs({ ...product, shippingInfo: [{ label: 'FOB Port', value: '' }] }, {}), []);
  });
});
