package org.snapscript.agent.debug;

import java.util.HashMap;
import java.util.Map;

import org.snapscript.agent.debug.BreakpointMatcher;

import junit.framework.TestCase;

public class SuspendMatcherTest extends TestCase {

   public void testSuspend() throws Exception {
      Map<String, Map<Integer, Boolean>> breakpoints = new HashMap<String, Map<Integer, Boolean>>();
      Map<Integer, Boolean> test = new HashMap<Integer, Boolean>();
      Map<Integer, Boolean> large = new HashMap<Integer, Boolean>();
      test.put(12,  true);
      test.put(7, true);
      test.put(8, false);
      large.put(210, true);
      large.put(66, true);
      large.put(7, true);
      breakpoints.put("/test.snap", test);
      breakpoints.put("/path/large.snap", large);
      BreakpointMatcher matcher = new BreakpointMatcher();
      matcher.update(breakpoints);
      assertTrue(matcher.isBreakpoint("/test.snap", 7));
      assertFalse(matcher.isBreakpoint("/test.snap", 77));
      assertFalse(matcher.isBreakpoint("/test.snap", 1334));
      assertTrue(matcher.isBreakpoint("/test.snap", 12));
      assertFalse(matcher.isBreakpoint("/test.snap", 8));
      assertTrue(matcher.isBreakpoint("/path/large.snap", 7));
   }
}
