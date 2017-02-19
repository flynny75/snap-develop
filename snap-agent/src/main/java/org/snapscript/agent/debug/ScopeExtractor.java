/*
 * ScopeExtractor.java December 2016
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

package org.snapscript.agent.debug;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import org.snapscript.core.Context;
import org.snapscript.core.Scope;

public class ScopeExtractor implements ScopeBrowser {

   private final AtomicReference<String> evaluate;
   private final ScopeNodeEvaluator evaluator;
   private final ScopeNodeTraverser traverser;
   private final AtomicBoolean execute;
   private final AtomicInteger counter;
   private final Set<String> watch;
   private final Set<String> local;
   
   public ScopeExtractor(Context context, Scope scope) {
      this.traverser = new ScopeNodeTraverser(context, scope);
      this.evaluator = new ScopeNodeEvaluator(context, scope);
      this.evaluate = new AtomicReference<String>();
      this.watch = new CopyOnWriteArraySet<String>();
      this.local = new CopyOnWriteArraySet<String>();
      this.execute = new AtomicBoolean();
      this.counter = new AtomicInteger();
   }
   
   public ScopeVariableTree build() {
      boolean refresh = execute.getAndSet(false);
      String expression = evaluate.get();
      Map<String, Map<String, String>> variables = traverser.expand(local);
      Map<String, Map<String, String>> evaluation = evaluator.expand(watch, expression, refresh);
      int change = counter.get(); 
      
      return new ScopeVariableTree.Builder(change)
         .withLocal(variables)
         .withEvaluation(evaluation)
         .build();
   }
   
   @Override
   public void browse(Set<String> expand) {
      local.clear();
      local.addAll(expand);
      counter.getAndIncrement();
   }
   
   @Override
   public void evaluate(Set<String> expand, String expression) {
      evaluate(expand, expression, false);
   }

   @Override
   public void evaluate(Set<String> expand, String expression, boolean refresh) {
      watch.clear();
      watch.addAll(expand);
      evaluate.set(expression);
      execute.set(refresh); // should we execute same expression again
      counter.getAndIncrement();
   }
  
}
