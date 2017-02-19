/*
 * ProcessConfiguration.java December 2016
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProcessConfiguration {

   private Map<String, String> variables;
   private List<String> arguments;
   private String classPath;
   private String host;
   private int port;
   
   public ProcessConfiguration() {
      this.variables = new HashMap<String, String>();
      this.arguments = new ArrayList<String>();
   }
   
   public List<String> getArguments() {
      return arguments;
   }
   
   public void setArguments(List<String> arguments) {
      this.arguments = arguments;
   }
   
   public Map<String, String> getVariables() {
      return variables;
   }
   
   public void setVariables(Map<String, String> variables) {
      this.variables = variables;
   }

   public String getClassPath() {
      return classPath;
   }

   public void setClassPath(String classPath) {
      this.classPath = classPath;
   }
   
   public String getHost() {
      return host;
   }

   public void setHost(String host) {
      this.host = host;
   }
   
   public int getPort() {
      return port;
   }

   public void setPort(int port) {
      this.port = port;
   }
}
