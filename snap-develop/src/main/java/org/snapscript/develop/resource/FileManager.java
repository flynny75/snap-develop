/*
 * FileManager.java December 2016
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

package org.snapscript.develop.resource;

import java.io.IOException;
import java.io.InputStream;

public class FileManager {

   private final String encoding;
   private final String base;

   public FileManager(String base) {
      this(base, "UTF-8");
   }
   
   public FileManager(String base, String encoding) {
      this.encoding = encoding;
      this.base = base;
   }

   public InputStream openInputStream(String path) throws IOException {
      String root = base;
      
      if(!root.startsWith("/")) {
         root = "/" + root;
      }
      if(path.startsWith("/")) {
         path = path.substring(1);
      }
      if(root.endsWith("/")) {
         return FileManager.class.getResourceAsStream(root +path);
      }
      return FileManager.class.getResourceAsStream(root + "/" +path);
   }
}
