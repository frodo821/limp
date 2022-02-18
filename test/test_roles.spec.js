const { expect } = require('chai');
const { parseRoleNameArgs } = require('..');

describe('parse documents', function () {
  describe('parse role name and args', function () {
    it('should be exploded into a name without args', function () {
      expect(parseRoleNameArgs('bold')).to.deep.equal({ name: 'bold', args: {}, unparsed: false });
      expect(parseRoleNameArgs('*code')).to.deep.equal({ name: 'code', args: {}, unparsed: true });
    });

    it('should be exploded into a name and positional args', function () {
      expect(parseRoleNameArgs('image(https://testtest)')).to.deep.equal({
        name: 'image', args: {
          0: 'https://testtest'
        }, unparsed: false
      });
      expect(parseRoleNameArgs('*code(bash)')).to.deep.equal({
        name: 'code', args: {
          0: 'bash'
        }, unparsed: true
      });
    });

    it('should be exploded into a name and keyword args', function () {
      expect(parseRoleNameArgs('image(url=https://testtest)')).to.deep.equal({
        name: 'image', args: {
          url: 'https://testtest'
        }, unparsed: false
      });
      expect(parseRoleNameArgs('*code(lang=bash)')).to.deep.equal({
        name: 'code', args: {
          lang: 'bash'
        }, unparsed: true
      });
    });

    it('should be exploded into a name and positional and keyword args', function () {
      expect(parseRoleNameArgs('image(alt texts, url=https://testtest)')).to.deep.equal({
        name: 'image', args: {
          0: 'alt texts',
          url: 'https://testtest'
        }, unparsed: false
      });
      expect(parseRoleNameArgs('*code(highlighted, lang=bash)')).to.deep.equal({
        name: 'code', args: {
          0: 'highlighted',
          lang: 'bash'
        }, unparsed: true
      });
    });
  });
});
