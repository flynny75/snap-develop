/*
 * PauseResource.java December 2016
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

import org.simpleframework.http.Request;
import org.simpleframework.http.Response;

public class PauseResource implements Resource {

   private final Resource resource;
   private final long pause;

   public PauseResource(Resource resource, long pause) {
      this.resource = resource;
      this.pause = pause;
   }

   @Override
   public void handle(Request request, Response response) throws Throwable {
      Thread.sleep(pause);
      resource.handle(request, response);
   }
}