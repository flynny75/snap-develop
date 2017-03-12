/*
 * CommandType.java December 2016
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

package org.snapscript.develop.command;

import static org.snapscript.develop.command.CommandOrigin.CLIENT;
import static org.snapscript.develop.command.CommandOrigin.ENGINE;
import static org.snapscript.develop.command.CommandOrigin.PROCESS;

public enum CommandType {
   PRINT_OUTPUT(PrintOutputCommandMarshaller.class, PrintOutputCommand.class, PROCESS),
   PRINT_ERROR(PrintErrorCommandMarshaller.class, PrintErrorCommand.class, PROCESS),
   EXECUTE(ExecuteCommandMarshaller.class, ExecuteCommand.class, CLIENT),
   SAVE(SaveCommandMarshaller.class, SaveCommand.class, CommandOrigin.CLIENT),
   RENAME(RenameCommandMarshaller.class, RenameCommand.class, CommandOrigin.CLIENT),   
   EXPLORE(ExploreCommandMarshaller.class, ExploreCommand.class, CommandOrigin.CLIENT),
   DELETE(DeleteCommandMarshaller.class, DeleteCommand.class, CommandOrigin.CLIENT),
   RELOAD_TREE(ReloadTreeCommandMarshaller.class, ReloadTreeCommand.class, ENGINE),
   BREAKPOINTS(BreakpointsCommandMarshaller.class, BreakpointsCommand.class, CommandOrigin.CLIENT),
   TERMINATE(TerminateCommandMarshaller.class, TerminateCommand.class, ENGINE),
   EXIT(ExitCommandMarshaller.class, ExitCommand.class, PROCESS),
   STOP(StopCommandMarshaller.class, StopCommand.class, CLIENT),
   PROBLEM(ProblemCommandMarshaller.class, ProblemCommand.class, ENGINE),
   SCOPE(ScopeCommandMarshaller.class, ScopeCommand.class, PROCESS),
   STEP(StepCommandMarshaller.class, StepCommand.class, CLIENT),
   BROWSE(BrowseCommandMarshaller.class, BrowseCommand.class, CLIENT),
   BEGIN(BeginCommandMarshaller.class, BeginCommand.class, PROCESS),
   PROFILE(ProfileCommandMarshaller.class, ProfileCommand.class, PROCESS),
   STATUS(StatusCommandMarshaller.class, StatusCommand.class, PROCESS),
   ATTACH(AttachCommandMarshaller.class, AttachCommand.class, CLIENT),
   ALERT(AlertCommandMarshaller.class, AlertCommand.class, ENGINE),
   EVALUATE(EvaluateCommandMarshaller.class, EvaluateCommand.class, CLIENT),
   PING(PingCommandMarshaller.class, PingCommand.class, CLIENT),
   FOLDER_EXPAND(FolderExpandCommandMarshaller.class, FolderExpandCommand.class, CLIENT),
   FOLDER_COLLAPSE(FolderCollapseCommandMarshaller.class, FolderCollapseCommand.class, CLIENT),
   DISPLAY_UPDATE(DisplayUpdateCommandMarshaller.class, DisplayUpdateCommand.class, CLIENT);
   
   public final Class<? extends CommandMarshaller> marshaller;
   public final Class<? extends Command> command;
   public final CommandOrigin origin;
   
   private CommandType(Class<? extends CommandMarshaller> marshaller, Class<? extends Command> command, CommandOrigin origin) {
      this.marshaller = marshaller;
      this.command = command;
      this.origin = origin;
   }
}
