/*
 * ProcessConfigurationLoader.java December 2016
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

package org.snapscript.develop.configuration;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class ProcessConfigurationLoader {

   private static final String JAVA_CLASS_PATH = "java.class.path";
   private static final String PATH_SEPARATOR = "path.separator";
   
   private final ConfigurationReader reader;
   
   public ProcessConfigurationLoader(ConfigurationReader reader) {
      this.reader = reader;
   }

   public void load(ProcessConfiguration configuration) {
      String path = System.getProperty(JAVA_CLASS_PATH);
      String separator = System.getProperty(PATH_SEPARATOR);
      Configuration data = reader.load();
      
      try {
         StringBuilder builder = new StringBuilder();
         
         if(data != null) {
            Map<String, String> environment = configuration.getVariables();
            Map<String, String> variables = data.getVariables();
            List<String> arguments = configuration.getArguments();
            List<File> dependencies = data.getDependencies();
            List<String> values = data.getArguments();
            String delimeter = "";

            if(dependencies != null) {
               for(File dependency : dependencies) {
                  if(!dependency.exists()) {
                     throw new IllegalStateException("Could not find dependency " + dependency);
                  }
                  String normal = dependency.getCanonicalPath();
                  
                  builder.append(delimeter);
                  builder.append(normal);
                  delimeter = separator;
               }
            }
            if(variables != null) {
               Set<String> names = variables.keySet();
               
               for(String name : names) {
                  String value = variables.get(name);
                  environment.put(name, value);
               }
            }
            if(values != null) {
               for(String value : values) {
                  String token = value.trim();
                  
                  if(!token.isEmpty()) {
                     arguments.add(token);
                  }
               }
            }
            if(dependencies != null) {
               path = builder.toString();
            }
         }
      } catch(Exception e) {
         throw new IllegalStateException("Could not load configuration", e);
      }
      configuration.setClassPath("." + separator + path);
   }

}
