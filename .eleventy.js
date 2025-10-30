module.exports = function(eleventyConfig) {
  eleventyConfig.addGlobalData("siteUrl", "https://blog.vinicius.xyz");

  eleventyConfig.addCollection("post", (collectionApi) => {
    return collectionApi.getFilteredByTag("post");
  });

  eleventyConfig.addGlobalData("eleventyComputed", {
    excerpt: (data) => {
      if (data.excerpt) return data.excerpt;
      const html = (data.page && data.page.templateContent) || "";
      const match = html.match(/<p>([\s\S]*?)<\/p>/i);
      const firstParagraph = match ? match[1] : "";
      const text = firstParagraph
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return text;
    }
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};

module.exports = function(eleventyConfig) {
  // Passa o arquivo CSS para o diretório final (_site)
  eleventyConfig.addPassthroughCopy("style.css");
  
  // Passa a pasta de imagens para o diretório final (_site)
  eleventyConfig.addPassthroughCopy("img");

  // Diz ao 11ty para processar posts na pasta 'posts'
  eleventyConfig.addCollection("post", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md");
  });

  return {
    // Define os diretórios de entrada e saída
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    },
    // Permite que Markdown e HTML sejam usados nos templates
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
