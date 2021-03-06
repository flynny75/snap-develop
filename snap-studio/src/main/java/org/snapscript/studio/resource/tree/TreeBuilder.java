package org.snapscript.studio.resource.tree;

import org.snapscript.studio.resource.display.DisplayModelResolver;
import org.snapscript.studio.resource.template.TemplateModel;

public class TreeBuilder {

   private final DisplayModelResolver resolver;
   
   public TreeBuilder(DisplayModelResolver resolver) {
      this.resolver = resolver;
   }
   
   public String createTree(TreeContext context, String treeId, boolean foldersOnly, int folderDepth) throws Throwable {
      StringBuilder builder = new StringBuilder();
      builder.append("<div id=\""+treeId+"\">\n");
      builder.append("<ul id=\"treeData\" style=\"display: none;\">\n");
      TemplateModel model = resolver.getModel();
      TreeDirectory tree = new TreeDirectory(
               context,
               model,
               foldersOnly,
               folderDepth);
      tree.buildTree(builder);
      builder.append("</ul>\n");
      builder.append("</div>\n");
      return builder.toString();
   }
   


}