/*
 * ProcessEventType.java December 2016
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

package org.snapscript.agent.event;

public enum ProcessEventType {
   WRITE_OUTPUT(WriteOutputEventMarshaller.class, WriteOutputEvent.class, 1),
   WRITE_ERROR(WriteErrorEventMarshaller.class, WriteErrorEvent.class, 2),
   PING(PingEventMarshaller.class, PingEvent.class, 3),
   PONG(PongEventMarshaller.class, PongEvent.class, 4),
   EXECUTE(ExecuteEventMarshaller.class, ExecuteEvent.class, 5),
   REGISTER(RegisterEventMarshaller.class, RegisterEvent.class, 6),
   SYNTAX_ERROR(SyntaxErrorEventMarshaller.class, SyntaxErrorEvent.class, 7),
   EXIT(ExitEventMarshaller.class, ExitEvent.class, 8),
   SCOPE(ScopeEventMarshaller.class, ScopeEvent.class, 9),
   BREAKPOINTS(BreakpointsEventMarshaller.class, BreakpointsEvent.class, 10),
   STEP(StepEventMarshaller.class, StepEvent.class, 11),
   START(BeginEventMarshaller.class, BeginEvent.class, 12),
   BROWSE(BrowseEventMarshaller.class, BrowseEvent.class, 13),
   PROFILE(ProfileEventMarshaller.class, ProfileEvent.class, 14),
   EVALUATE(EvaluateEventMarshaller.class, EvaluateEvent.class, 15),
   FAULT(FaultEventMarshaller.class, FaultEvent.class, 16);
   
   public final Class<? extends ProcessEventMarshaller> marshaller;
   public final Class<? extends ProcessEvent> event;
   public final int code;
   
   private ProcessEventType(Class<? extends ProcessEventMarshaller> marshaller, Class<? extends ProcessEvent> event, int code) {
      this.marshaller = marshaller;
      this.event = event;
      this.code = code;
   }
}
