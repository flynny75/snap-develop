/*
 * TemplateModel.java December 2016
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

package org.snapscript.develop.resource.template;

import java.util.Collections;
import java.util.Map;

public class TemplateModel {
   
   private final Map<String, Object> attributes;
   
   public TemplateModel() {
      this(Collections.EMPTY_MAP);
   }
   
   public TemplateModel(Map<String, Object> attributes) {
      this.attributes = attributes;
   }
   
   public void setAttribute(String name, Object value) {
      attributes.put(name, value);
   }
   
   public Map<String, Object> getAttributes() {
      return attributes;
   }
   
   public Object getAttribute(String name) {
      return attributes.get(name);
   }
}