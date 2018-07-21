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
        assume(slug.slug(' a question mark?')).equals('a-question-mark');
        assume(slug.slug('something & something else')).equals("something--something-else");
        assume(slug.slug('unicode ♥ is ☢')).equals("unicode--is-");
        assume(slug.slug('greek ∆ delta')).equals("greek--does-something");
        assume(slug.slug('copy © stuff ')).equals("copy-");        
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
