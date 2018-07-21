import slugify from 'slugify';


export default class GithubSlugify {

  constructor() {
    this.slugs = {};
  }

  slug(text) {
    const slug = slugify(text, { lower: true });
    let uniqueSlug = slug;

    this.slugs[slug] = this.slugs[slug] || 0;
    if (this.slugs[slug]) {
      uniqueSlug = `${slug}-${this.slugs[slug]}`;
    }
    this.slugs[slug] += 1;
    return uniqueSlug;
  }

  reset() {
    this.slugs = {};
  }

}
