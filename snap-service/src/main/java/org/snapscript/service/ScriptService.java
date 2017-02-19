/*
 * ScriptService.java December 2016
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

package org.snapscript.service;

import static org.snapscript.core.Reserved.DEFAULT_PACKAGE;

import java.util.concurrent.Executor;

import org.snapscript.common.ThreadPool;
import org.snapscript.compile.Compiler;
import org.snapscript.compile.Executable;
import org.snapscript.compile.ResourceCompiler;
import org.snapscript.compile.StoreContext;
import org.snapscript.core.Context;
import org.snapscript.core.ExpressionEvaluator;
import org.snapscript.core.FilePathConverter;
import org.snapscript.core.Model;
import org.snapscript.core.PathConverter;
import org.snapscript.core.store.Store;

public class ScriptService {

   public static void main(String[] options) throws Exception {
      CommandLineParser parser = new CommandLineParser();
      PathConverter converter = new FilePathConverter();
      CommandLine line = parser.parse(options);
      Store store = line.getStore();
      String evaluate = line.getEvaluation();
      String script = line.getScript();
      Model model = line.getModel();
      String module = DEFAULT_PACKAGE;
      
      if(evaluate == null && script == null) {
         System.err.println("Neither --evaluate or --script have been specified");
         System.exit(0);
      }
      Executor executor = new ThreadPool(6);
      Context context = new StoreContext(store, executor);
      Compiler compiler = new ResourceCompiler(context);
      Executable executable = null;
      
      if(script != null) {
         module = converter.createModule(script);
         executable = compiler.compile(script);
      }
      if(evaluate != null) {
         ExpressionEvaluator evaluator = context.getEvaluator();
         evaluator.evaluate(model, evaluate, module);
      } else {
         executable.execute(model);
      }
   }
}
