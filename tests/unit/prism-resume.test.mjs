import test from 'node:test';
import assert from 'node:assert/strict';
import { resumePreviewUrl } from '../../themes/shared/resume-preview.mjs';
test('resume embeds canonical Drive files and direct PDF paths without changing external actions',()=>{
 assert.equal(resumePreviewUrl('https://drive.google.com/file/d/fixture-123/view?usp=sharing'),'https://drive.google.com/file/d/fixture-123/preview');
 assert.equal(resumePreviewUrl('/resume.pdf'),'/resume.pdf');
 assert.equal(resumePreviewUrl('https://example.com/resume.pdf?version=1'),'https://example.com/resume.pdf?version=1');
 assert.equal(resumePreviewUrl('https://example.com/view'),null);
 assert.equal(resumePreviewUrl('javascript:alert(1)'),null);
 assert.equal(resumePreviewUrl('//example.com/resume.pdf'),null);
});
