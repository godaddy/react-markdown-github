import React from 'react';
import ReactMarkdownGithub from '../src';
import { mount } from 'enzyme';
import assume from 'assume';
import assumeEnzyme from 'assume-enzyme';

assume.use(assumeEnzyme);

describe('ReactMarkdownGithub', function () {
  let element;
  let tree;

  afterEach(() => {
    if (tree && typeof tree.unmount === 'function')
      tree.unmount();
  });

  // Renders the ReactMarkdownGithub with the props supplied
  function renderFullDom(props) {
    element = React.createElement(ReactMarkdownGithub, props);
    tree = mount(element);
  }

  it('custom { className } should be passed to ReactMarkdown', () => {
    const input = '# Header\n\nParagraph\n## Super Long Header \n1. List item\n2. List item 2\n\nFoo';
    renderFullDom({ source: input, className: 'neatClass' });
    assume(tree).to.have.className('neatClass');
    assume(tree).to.not.have.className('florb');

    renderFullDom({ source: input });
    assume(tree).to.not.have.className('neatClass');
  });

  describe('images', function () {
    it('default handler does not modify image url', () => {
      const input = 'Some markdown  ![alt text](https://someplace/bar.png "Logo Title Text 1")  with a random image in it.';
      renderFullDom({
        source: input
      });
      assume(tree.find('img')).to.have.length(1);
      assume(tree.find('img').prop('src')).is.equal('https://someplace/bar.png');
    });
    it('proxy url rewrites realitive urls', () => {
      const input = 'Some markdown  ![alt text](resources/bar.png "Logo Title Text 1")  with a random image in it.';
      const resolver = ({ url, github, org, repo, filename }) => {
        assume(url).to.exist();
        assume(github).equals('https://github.mycorp.com/');
        assume(org).equals('org');
        assume(repo).equals('component');
        assume(filename).to.exist();
        return `https://git-proxy.mycorp.com/${org}/${repo}/${url}`;
      };
      renderFullDom({
        source: input,
        sourceUrl: 'https://github.mycorp.com/org/component/blob/master/README.md',
        transformImageUri: resolver
      });

      //
      assume(tree.find('img')).to.have.length(1);
      assume(tree.find('img').prop('src')).is.equal('https://git-proxy.mycorp.com/org/component/resources/bar.png');
    });
    it('custom url handler should be passed to ReactMarkdown', () => {
      const input = 'Some markdown  ![alt text](bar.png "Logo Title Text 1")  with a random image in it.';
      renderFullDom({
        source: input,
        transformImageUri: () => 'foo.png'
      });
      assume(tree.find('img')).to.have.length(1);
      assume(tree.find('img').prop('src')).is.equal('foo.png');
    });
  });

  describe('renderers', function () {
    it('custom { renderers } should be passed to ReactMarkdown', () => {
      const input = 'some markdown to obliviate';
      renderFullDom({
        source: input,
        renderers: { text: () => 'xxxxxxx' }
      });

      assume(tree.find('p')).to.have.length(1);
      assume(tree.text()).to.equal('xxxxxxx');
    });

    it('Automatically creates anchors for all h{1,2}', () => {
      const input = `
# Header

Paragraph

## Super Long Header
Test

# Header

Repeat Header
1. List item
2. List item 2

Foo

# Header

Repeat Header`;

      renderFullDom({ source: input });

      assume(tree.find('#header')).to.have.length(1);
      assume(tree.find('#header').find('a').prop('href')).is.equal('#header');

      // check duplicates
      assume(tree.find('#header1')).to.have.length(1);
      assume(tree.find('#header1').find('a').prop('href')).is.equal('#header1');
      assume(tree.find('#header2')).to.have.length(1);
      assume(tree.find('#header2').find('a').prop('href')).is.equal('#header2');

      assume(tree.find('#super-long-header')).to.have.length(1);
      assume(tree.find('#super-long-header').find('a').prop('href')).is.equal('#super-long-header');
      assume(tree.find('#blort')).to.have.length(0);
    });

    it('A header with non text elements', () => {
      const input = '### `codething` in the header `moreCode` txt';

      renderFullDom({ source: input });

      assume(tree.find('#codething-in-the-header-morecode-txt')).to.have.length(1);
      assume(tree.find('#codething-in-the-header-morecode-txt')
        .find('a').prop('href')).is.equal('#codething-in-the-header-morecode-txt');
    });
  });

  describe('href customization', () => {
    const urlMap = {
      'https://github.mycorp.com/org/component/blob/master/lib/test/FOO.md': 'http://contentsite.com/foo.html'
    };

    /*
     * Renders the target `input` with a few common properties
     * { className, sourceUrl, resolver } for consistency in tests.
     */
    function renderDomWithResolver(input) {
      renderFullDom({
        source: input,
        className: 'neatClass',
        sourceUrl: 'https://github.mycorp.com/org/component/blob/master/README.md',
        resolver: ({ url, github, org, repo, filename }) => {
          // Validate all resolver params
          assume(url).to.exist();
          assume(github).equals('https://github.mycorp.com/');
          assume(org).equals('org');
          assume(repo).equals('component');
          assume(filename).to.exist();

          url = urlMap[url] || url;
          return  url;
        }
      });
    }

    /*
     * Assumes that the current tree has exactly one anchor tag
     * with the given `href`.
     */
    function assumeSingeHrefEquals(href) {
      assume(tree.find('a')).to.have.length(1);
      assume(tree.find('a').prop('href')).is.equal(href);
    }

    it('does not transform absolute links', () => {
      const input = `[I'm an inline-style link](https://www.google.com)`;
      renderDomWithResolver(input);
      assumeSingeHrefEquals('https://www.google.com');
    });

    it('transform realitive links', () => {
      const input = `[I'm a relative reference to a repository file](./FOO.md)`;
      renderDomWithResolver(input);
      assumeSingeHrefEquals('https://github.mycorp.com/org/component/blob/master/FOO.md');
    });

    it('transform realitive links with anchors', () => {
      const input = `[I'm a relative reference to a repository file](./FOO.md#Overview)`;
      renderDomWithResolver(input);
      assumeSingeHrefEquals('https://github.mycorp.com/org/component/blob/master/FOO.md#Overview');
    });

    it('transform deep path urls', () => {
      const input = `[I'm a relative reference to a repository file](lib/test/BAR.md)`;
      renderDomWithResolver(input);
      assumeSingeHrefEquals('https://github.mycorp.com/org/component/blob/master/lib/test/BAR.md');
    });

    it('custom resolver changes matched url', () => {
      const input = `[I'm a relative reference to a repository file](lib/test/FOO.md)`;
      renderDomWithResolver(input);
      assumeSingeHrefEquals('http://contentsite.com/foo.html');
    });
  });
});
