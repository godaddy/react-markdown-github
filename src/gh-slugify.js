/**
 * This code is attempting to copy the Ruby pipeline filter GH uses to add unique ids to headings:
 * https://github.com/jch/html-pipeline/blob/master/lib/html/pipeline/toc_filter.rb
 * 
 */


const replace = /[^a-zA-Z\- ]/g;
const whitespace = /\s/g;

export default class GithubSlugify {

  constructor() {
    this.slugs = {};
    this.replacementChar = '-';
  }

  replace (string) {
    string = string.toLowerCase();
    return string.trim()
      .replace(replace, '')
      .replace(whitespace, this.replacementChar)
  }

  slug(text) {
    const slug = this.replace(text);
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
