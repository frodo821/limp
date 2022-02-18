const { expect } = require('chai');
const { compileToHTML: compile } = require('..');

describe('test renderers', function () {
  describe('test text decorations', function () {
    it('bold role should be rendered with <b></b> tag', function () {
      expect(compile(":bold:text;").slice(26, -10)).to.equal("<b>text</b>");
      expect(compile(":b:text;").slice(26, -10)).to.equal("<b>text</b>");
    });

    it('italic role should be rendered with <i></i> tag', function () {
      expect(compile(":italic:text;").slice(26, -10)).to.equal("<i>text</i>");
      expect(compile(":i:text;").slice(26, -10)).to.equal("<i>text</i>");
    });

    it('underlined role should be rendered with <u></u> tag', function () {
      expect(compile(":underlined:text;").slice(26, -10)).to.equal("<u>text</u>");
      expect(compile(":u:text;").slice(26, -10)).to.equal("<u>text</u>");
    });

    it('strikethrough role should be rendered with <s></s> tag', function () {
      expect(compile(":strike:text;").slice(26, -10)).to.equal("<s>text</s>");
      expect(compile(":s:text;").slice(26, -10)).to.equal("<s>text</s>");
    });
  });

  describe('test ref role', function () {
    it('should render ref with <a></a> tag', function () {
      expect(compile(":ref(#):text;").slice(26, -10)).to.equal('<a href="#" target="_self" class="limp-inline">text</a>');
      expect(compile(":ref(url=https\\://google.co.jp/):text;").slice(26, -10)).to.equal('<a href="https://google.co.jp/" target="_self" class="limp-inline">text</a>');
      expect(compile(":ref(#, _blank):text;").slice(26, -10)).to.equal('<a href="#" target="_blank" class="limp-inline">text</a>');
      expect(compile(":ref(url=https\\://google.co.jp/, target=_blank):text;").slice(26, -10)).to.equal('<a href="https://google.co.jp/" target="_blank" class="limp-inline">text</a>');
    });
  });
});
