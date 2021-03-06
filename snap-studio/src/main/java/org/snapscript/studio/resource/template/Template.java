package org.snapscript.studio.resource.template;

import java.io.Writer;

public interface Template {
   void render(TemplateFilter filter, Writer writer) throws Exception;
   boolean isStale();
}