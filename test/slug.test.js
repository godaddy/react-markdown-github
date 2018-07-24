import assume from 'assume';
import GithubSlugify from '../src/gh-slugify';


describe('GithubSlugify', function () {

  it('Can create a GithubSlugify', () => {
    const slug = new GithubSlugify();
    assume(slug).is.an('object');
    assume(slug.slug('this is neat')).equals('this-is-neat');
  });


  it('increments duplicates', () => {
    const slug = new GithubSlugify();
    assume(slug.slug('this is neat')).equals('this-is-neat');
    assume(slug.slug('something else')).equals('something-else');
    assume(slug.slug('this is neat')).equals('this-is-neat-1');
    assume(slug.slug('this is neat')).equals('this-is-neat-2');
  });

  it('non-text-chars', () => {
    const slug = new GithubSlugify();
    assume(slug.slug(' a `code block` in the header')).equals('a-code-block-in-the-header');
    assume(slug.slug(' `codething` in the header `moreCode` txt')).equals('codething-in-the-header-morecode-txt');


    assume(slug.slug(' a question mark?')).equals('a-question-mark');
    assume(slug.slug('something & something else')).equals('something--something-else');
    assume(slug.slug('greek ∆ does something')).equals('greek--does-something');
    assume(slug.slug('copy ©')).equals('copy-');
    assume(slug.slug('Other punctuation, such as d.o.t.s, commas')).equals('other-punctuation-such-as-dots-commas');
    assume(slug.slug('Emdash –– and dash --')).equals('emdash--and-dash---');
    assume(slug.slug('Ampersand &')).equals('ampersand-');
    assume(slug.slug('Backslashes// or slashes\\')).equals('backslashes-or-slashes');
    assume(slug.slug('Complex code blocks like `/foo/bar/:bazz?buzz=foo`')).equals('complex-code-blocks-like-foobarbazzbuzzfoo');
    assume(slug.slug(' Bold formatting **like this**')).equals('bold-formatting-like-this');
    assume(slug.slug('Italic formatting _like this_')).equals('italic-formatting-like-this');
    assume(slug.slug(' All !@# the $%^ colors &*( of ){} the |~ punctuation < "\' rainbow += '))
      .equals('all--the--colors--of--the--punctuation---rainbow-');
    // assume(slug.slug(' Seriously all of them ... Alt + [q-|] œ∑´®†¥¨ˆøπ“‘«')).equals('seriously-all-of-them--alt--q--œˆøπ');
    // assume(slug.slug('unicode ♥ is ☢')).equals('unicode--is-');

  });


  it('can reset unique counts', () => {
    const slug = new GithubSlugify();
    assume(slug.slug('this is neat')).equals('this-is-neat');
    assume(slug.slug('something else')).equals('something-else');
    assume(slug.slug('this is neat')).equals('this-is-neat-1');
    assume(slug.slug('this is neat')).equals('this-is-neat-2');
    assume(slug.slug('something else')).equals('something-else-1');
    slug.reset();
    assume(slug.slug('this is neat')).equals('this-is-neat');
    assume(slug.slug('something else')).equals('something-else');
  });

});
