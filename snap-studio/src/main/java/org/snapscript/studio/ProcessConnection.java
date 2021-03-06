package org.snapscript.studio;

import java.util.Map;
import java.util.Set;

import lombok.AllArgsConstructor;

import org.snapscript.agent.event.BreakpointsEvent;
import org.snapscript.agent.event.BrowseEvent;
import org.snapscript.agent.event.EvaluateEvent;
import org.snapscript.agent.event.ExecuteEvent;
import org.snapscript.agent.event.PingEvent;
import org.snapscript.agent.event.ProcessEventChannel;
import org.snapscript.agent.event.StepEvent;
import org.snapscript.agent.log.ProcessLogger;

@AllArgsConstructor
public class ProcessConnection {

   private final ProcessEventChannel channel;
   private final ProcessLogger logger;
   private final String process;

   public boolean execute(String project, String path, Map<String, Map<Integer, Boolean>> breakpoints, boolean debug) {
      try {
         ExecuteEvent event = new ExecuteEvent.Builder(process)
            .withProject(project)
            .withResource(path)
            .withBreakpoints(breakpoints)
            .withDebug(debug)
            .build();

         return channel.send(event);
      } catch (Exception e) {
         logger.info(process + ": Error occured sending execute event", e);
         close(process + ": Error occured sending execute event: " + e);
         throw new IllegalStateException("Could not execute script '" + path + "' for '" + process + "'", e);
      }
   }
   
   public boolean suspend(Map<String, Map<Integer, Boolean>> breakpoints) {
      try {
         BreakpointsEvent event = new BreakpointsEvent.Builder(process)
            .withBreakpoints(breakpoints)
            .build();
         
         return channel.send(event);
      } catch (Exception e) {
         logger.info(process + ": Error occured sending suspend event", e);
         close(process + ": Error occured sending suspend event: " + e);
         throw new IllegalStateException("Could not set breakpoints '" + breakpoints + "' for '" + process + "'", e);
      }
   }
   
   public boolean browse(String thread, Set<String> expand) {
      try {
         BrowseEvent event = new BrowseEvent.Builder(process)
            .withThread(thread)
            .withExpand(expand)
            .build();
         
         return channel.send(event);
      } catch (Exception e) {
         logger.info(process + ": Error occured sending browse event", e);
         close(process + ": Error occured sending browse event: " + e);
         throw new IllegalStateException("Could not browse '" + thread + "' for '" + process + "'", e);
      }
   }
   
   public boolean evaluate(String thread, String expression, boolean refresh, Set<String> expand) {
      try {
         EvaluateEvent event = new EvaluateEvent.Builder(process)
            .withThread(thread)
            .withExpression(expression)
            .withRefresh(refresh)
            .withExpand(expand)
            .build();
         
         return channel.send(event);
      } catch (Exception e) {
         logger.info(process + ": Error occured sending evaluate event", e);
         close(process + ": Error occured sending evaluate event: " + e);
         throw new IllegalStateException("Could not evaluate '" + expression + "' on '" + thread + "' for '" + process + "'", e);
      }
   }
   
   public boolean step(String thread, int type) {
      try {
         StepEvent event = new StepEvent.Builder(process)
            .withThread(thread)
            .withType(type)
            .build();

         return channel.send(event);
      } catch (Exception e) {
         logger.info(process + ": Error occured sending step event", e);
         close(process + ": Error occured sending step event: " + e);
         throw new IllegalStateException("Could not resume script thread '" + thread + "' for '" + process + "'", e);
      }
   }

   public boolean ping(long time) {
      try {
         PingEvent event = new PingEvent.Builder(process)
            .withTime(time)
            .build();
         
         if(channel.send(event)) {
            logger.trace(process + ": Ping succeeded");
            return true;
         }
         logger.info(process + ": Ping failed");
      } catch (Exception e) {
         logger.info(process + ": Error occured sending ping event", e);
         close(process + ": Error occured sending ping event: " + e);
      }
      return false;
   }
   
   public void close(String reason) {
      try {
         logger.info(process + ": Closing connection: " +reason);
         channel.close(process + ": Closing connection: " +reason);
      } catch (Exception e) {
         logger.info(process + ": Error occured closing channel", e);
      }
   }

   public String getProcess() {
      return process;
   }
   
   @Override
   public String toString() {
      return process;
   }
}