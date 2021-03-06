package org.snapscript.studio.tunnel;

import org.snapscript.agent.event.BeginEvent;
import org.snapscript.agent.event.BreakpointsEvent;
import org.snapscript.agent.event.BrowseEvent;
import org.snapscript.agent.event.EvaluateEvent;
import org.snapscript.agent.event.ExecuteEvent;
import org.snapscript.agent.event.ExitEvent;
import org.snapscript.agent.event.FaultEvent;
import org.snapscript.agent.event.PingEvent;
import org.snapscript.agent.event.PongEvent;
import org.snapscript.agent.event.ProcessEvent;
import org.snapscript.agent.event.ProcessEventChannel;
import org.snapscript.agent.event.ProcessEventListener;
import org.snapscript.agent.event.ProfileEvent;
import org.snapscript.agent.event.RegisterEvent;
import org.snapscript.agent.event.ScopeEvent;
import org.snapscript.agent.event.StepEvent;
import org.snapscript.agent.event.SyntaxErrorEvent;
import org.snapscript.agent.event.WriteErrorEvent;
import org.snapscript.agent.event.WriteOutputEvent;

public class ProcessEventRouter {

   private final ProcessEventListener listener;
   
   public ProcessEventRouter(ProcessEventListener listener) {
      this.listener = listener;
   }
   
   public void route(ProcessEventChannel channel, ProcessEvent event) throws Exception {
      if(event instanceof ExitEvent) {
         listener.onExit(channel, (ExitEvent)event);
      } else if(event instanceof ExecuteEvent) {
         listener.onExecute(channel, (ExecuteEvent)event);                  
      } else if(event instanceof RegisterEvent) {
         listener.onRegister(channel, (RegisterEvent)event);
      } else if(event instanceof SyntaxErrorEvent) {
         listener.onSyntaxError(channel, (SyntaxErrorEvent)event);
      } else if(event instanceof WriteErrorEvent) {
         listener.onWriteError(channel, (WriteErrorEvent)event);
      } else if(event instanceof WriteOutputEvent) {
         listener.onWriteOutput(channel, (WriteOutputEvent)event);
      } else if(event instanceof PingEvent) {
         listener.onPing(channel, (PingEvent)event);
      } else if(event instanceof PongEvent) {
         listener.onPong(channel, (PongEvent)event);
      } else if(event instanceof ScopeEvent) {
         listener.onScope(channel, (ScopeEvent)event);
      } else if(event instanceof BreakpointsEvent) {
         listener.onBreakpoints(channel, (BreakpointsEvent)event);
      } else if(event instanceof BeginEvent) {
         listener.onBegin(channel, (BeginEvent)event);
      } else if(event instanceof StepEvent) {
         listener.onStep(channel, (StepEvent)event);
      } else if(event instanceof BrowseEvent) {
         listener.onBrowse(channel, (BrowseEvent)event);
      } else if(event instanceof EvaluateEvent) {
         listener.onEvaluate(channel, (EvaluateEvent)event);                  
      } else if(event instanceof ProfileEvent) {
         listener.onProfile(channel, (ProfileEvent)event);
      } else if(event instanceof EvaluateEvent) {
         listener.onEvaluate(channel, (EvaluateEvent)event);
      } else if(event instanceof FaultEvent) {
         listener.onFault(channel, (FaultEvent)event);
      }
   }
}