  class floatFlow extends Paged.Handler {
      constructor(chunker, polisher, caller) {
          super(chunker, polisher, caller);
      }

      afterRendered(pages) {
          const page = document.querySelectorAll(".pagedjs_page");

          console.log(page.length)
      }
  }
  Paged.registerHandlers(floatFlow);