const { expect } = require('chai');
const self = require('../dist/main');

describe('test renderers', function () {
  describe('test text decorations', function () {
    it('bold role should be rendered with <b></b> tag', function () {
      expect(self.compile(":bold:text;").slice(23)).to.equal("<b>text</b></div>");
      expect(self.compile(":b:text;").slice(23)).to.equal("<b>text</b></div>");
    });

    it('italic role should be rendered with <i></i> tag', function () {
      expect(self.compile(":italic:text;").slice(23)).to.equal("<i>text</i></div>");
      expect(self.compile(":i:text;").slice(23)).to.equal("<i>text</i></div>");
    });

    it('underlined role should be rendered with <u></u> tag', function () {
      expect(self.compile(":underlined:text;").slice(23)).to.equal("<u>text</u></div>");
      expect(self.compile(":u:text;").slice(23)).to.equal("<u>text</u></div>");
    });

    it('strikethrough role should be rendered with <s></s> tag', function () {
      expect(self.compile(":strike:text;").slice(23)).to.equal("<s>text</s></div>");
      expect(self.compile(":s:text;").slice(23)).to.equal("<s>text</s></div>");
    });
  });

  describe('test ref role', function () {
    it('should render ref with <a></a> tag', function () {
      expect(self.compile(":ref(#):text;").slice(23)).to.equal('<a href="#" target="_self" class="limp-inline">text</a></div>');
      expect(self.compile(":ref(url=https\\://google.co.jp/):text;").slice(23)).to.equal('<a href="https://google.co.jp/" target="_self" class="limp-inline">text</a></div>');
      expect(self.compile(":ref(#, _blank):text;").slice(23)).to.equal('<a href="#" target="_blank" class="limp-inline">text</a></div>');
      expect(self.compile(":ref(url=https\\://google.co.jp/, target=_blank):text;").slice(23)).to.equal('<a href="https://google.co.jp/" target="_blank" class="limp-inline">text</a></div>');
    });
  });
});
