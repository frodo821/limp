const { expect } = require('chai');
const self = require('../dist/main');

describe('parse inline roles', function () {
  describe('parse inline role not nested without args in a cluster', function () {
    it('should be parsed with a inline role', function () {
      const text = self.parseInline(":bold:this is bold text;");

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
      const text = self.parseInline(":underlined::bold:this is bold, underlined text;;");

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
      const text = self.parseInline(":underlined::ref(#target):this is underlined anchor;;");

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
      const text = self.parseInline(`:underlined::ref(#target):this is underlined anchor;;

:underlined::bold:this is bold, underlined text;;`);

      expect(text.children.length).to.equal(2);
    });
  });
});
