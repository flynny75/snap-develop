/*
 * FileExpressionFilter.java December 2016
 *
 * Copyright (C) 2016, Niall Gallagher <niallg@users.sf.net>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
 * implied. See the License for the specific language governing 
 * permissions and limitations under the License.
 */

package org.snapscript.develop.find;

import java.io.File;
import java.io.FilenameFilter;

public class FileExpressionFilter implements FilenameFilter {
   
   private final ExpressionResolver resolver;
   private final PathBuilder builder;
   
   public FileExpressionFilter(ExpressionResolver resolver, PathBuilder builder) {
      this.resolver = resolver;
      this.builder = builder;
   }

   @Override
   public boolean accept(File file, String name) {
      if(file.isFile()) {
         String source = builder.buildPath(file);
         String result = resolver.match(source);
         
         if(result != null) {
            return true;
         }
      }
      return false;
   }

}