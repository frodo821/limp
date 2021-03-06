const { expect } = require('chai');
const { parseInline, parseDocument } = require('..');

describe('parse inline roles', function () {
  describe('parse inline role not nested without args in a cluster', function () {
    it('should be parsed with a inline role', function () {
      const text = parseInline(":bold:this is bold text;");

      expect(text.children.length).to.equal(1);
      expect(text.children[0].type).to.equal('role');
      expect(text.children[0].name).to.equal('bold');
      expect(text.children[0].args).to.deep.equal({});
      expect(text.children[0].unparsed).to.equal(false);
      expect(text.children[0].children.length).to.equal(1);
      expect(text.children[0].children[0].type).to.equal('text');
      expect(text.children[0].children[0].self).to.equal('this is bold text');
    });
  });

  describe('parse inline role nested without args in a cluster', function () {
    it('should be parsed with a nested inline role', function () {
      const text = parseInline(":underlined::bold:this is bold, underlined text;;");

      expect(text.children.length).to.equal(1);
      expect(text.children[0].type).to.equal('role');
      expect(text.children[0].name).to.equal('underlined');
      expect(text.children[0].args).to.deep.equal({});
      expect(text.children[0].unparsed).to.equal(false);
      expect(text.children[0].children.length).to.equal(1);
      expect(text.children[0].children[0].type).to.equal('role');
      expect(text.children[0].children[0].name).to.equal('bold');
      expect(text.children[0].children[0].args).to.deep.equal({});
      expect(text.children[0].children[0].unparsed).to.equal(false);
      expect(text.children[0].children[0].children.length).to.equal(1);
      expect(text.children[0].children[0].children[0].type).to.equal('text');
      expect(text.children[0].children[0].children[0].self).to.equal('this is bold, underlined text');
    });
  });

  describe('parse inline role nested with args in a cluster', function () {
    it('should be parsed with a nested inline role with args', function () {
      const text = parseInline(":underlined::ref(#target):this is underlined anchor;;");

      expect(text.children.length).to.equal(1);
      expect(text.children[0].type).to.equal('role');
      expect(text.children[0].name).to.equal('underlined');
      expect(text.children[0].args).to.deep.equal({});
      expect(text.children[0].unparsed).to.equal(false);
      expect(text.children[0].children.length).to.equal(1);
      expect(text.children[0].children[0].type).to.equal('role');
      expect(text.children[0].children[0].name).to.equal('ref');
      expect(text.children[0].children[0].args).to.deep.equal({ 0: '#target' });
      expect(text.children[0].children[0].unparsed).to.equal(false);
      expect(text.children[0].children[0].children.length).to.equal(1);
      expect(text.children[0].children[0].children[0].type).to.equal('text');
      expect(text.children[0].children[0].children[0].self).to.equal('this is underlined anchor');
    });
  });

  describe('parse inline role in two clusters', function () {
    it('should be parsed with a nested inline role in two clusters', function () {
      const text = parseInline(`:underlined::ref(#target):this is underlined anchor;;

:underlined::bold:this is bold, underlined text;;`);

      expect(text.children.length).to.equal(2);
    });
  });

  describe('parse titles', function () {
    it('should be parsed as a header', function () {
      const text = parseDocument(`heading\n=======`);

      expect(text.children.length).to.equal(1);
      expect(text.children[0].type).to.equal('title');
      expect(text.children[0].level).to.equal(1);
      expect(text.children[0].children.length).to.equal(1);
      expect(text.children[0].children[0].type).to.equal('text');
      expect(text.children[0].children[0].self).to.equal('heading');
    });

    it('should be parsed as a 2nd level header', function () {
      const text = parseDocument(`heading\n-------`);

      expect(text.children.length).to.equal(1);
      expect(text.children[0].type).to.equal('title');
      expect(text.children[0].level).to.equal(2);
      expect(text.children[0].children.length).to.equal(1);
      expect(text.children[0].children[0].type).to.equal('text');
      expect(text.children[0].children[0].self).to.equal('heading');
    });

    it('should be parsed as a 3rd level header', function () {
      const text = parseDocument(`heading\n*******`);

      expect(text.children.length).to.equal(1);
      expect(text.children[0].type).to.equal('title');
      expect(text.children[0].level).to.equal(3);
      expect(text.children[0].children.length).to.equal(1);
      expect(text.children[0].children[0].type).to.equal('text');
      expect(text.children[0].children[0].self).to.equal('heading');
    });

    it('should be parsed as a 4th level header', function () {
      const text = parseDocument(`heading\n#######`);

      expect(text.children.length).to.equal(1);
      expect(text.children[0].type).to.equal('title');
      expect(text.children[0].level).to.equal(4);
      expect(text.children[0].children.length).to.equal(1);
      expect(text.children[0].children[0].type).to.equal('text');
      expect(text.children[0].children[0].self).to.equal('heading');
    });
  });
});
