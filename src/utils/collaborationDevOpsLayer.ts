/**
 * FASE 10 — Collaboration, Version Control & DevOps Platform
 * ==========================================================
 * Transforms Mobile Studio into a collaborative professional development platform.
 *
 * All architecture remains based on Intermediate Representation (IR).
 * Integrates with: Runtime Universal, Data Layer, Identity Layer, Export Engine.
 */

import { StudioIR, compileProjectToIR, IRComponent, IRScreen, IRCollaborationMeta } from './irCompiler';
import { Project, Screen, CanvasComponent } from '../types';
import { studioEventBus } from './eventBus';
import { packagingManager } from './packagingDeploymentLayer';
import { identityManager } from './identitySecurityLayer';
import { exportEngine } from './professionalExportEngine';

// ==========================================
// ETAPA 1 — VERSION CONTROL ENGINE
// ==========================================

export interface VersionSnapshot {
  id: string;
  version: string;
  timestamp: string;
  author: string;
  message: string;
  tags: string[];
  branch: string;
  projectSnapshot: Project;
  irSnapshot: StudioIR;
  metadata: Record<string, any>;
  parentId?: string;
  childrenIds: string[];
}

export interface Branch {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  headSnapshotId: string;
  isDefault: boolean;
  isProtected: boolean;
  sourceBranch?: string;
}

export interface VersionDiff {
  snapshotIdA: string;
  snapshotIdB: string;
  addedScreens: { id: string; name: string }[];
  removedScreens: { id: string; name: string }[];
  modifiedScreens: {
    id: string;
    name: string;
    addedComponents: number;
    removedComponents: number;
    modifiedProperties: string[];
  }[];
  summary: {
    totalChanges: number;
    screensAdded: number;
    screensRemoved: number;
    screensModified: number;
    componentsAdded: number;
    componentsRemoved: number;
  };
}

export class VersionControlEngine {
  private snapshots: VersionSnapshot[] = [];
  private branches: Branch[] = [
    {
      id: 'branch_main',
      name: 'main',
      description: 'Branch principal de produção',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'system',
      headSnapshotId: '',
      isDefault: true,
      isProtected: true,
    },
    {
      id: 'branch_dev',
      name: 'development',
      description: 'Branch de desenvolvimento',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'system',
      headSnapshotId: '',
      isDefault: false,
      isProtected: false,
      sourceBranch: 'main',
    },
  ];

  private activeBranch: string = 'main';
  private snapshotCounter = 0;

  createSnapshot(project: Project, author: string, message: string, tags: string[] = []): VersionSnapshot {
    const ir = compileProjectToIR(project);
    const branch = this.getBranch(this.activeBranch);
    const parentId = branch ? branch.headSnapshotId : undefined;

    const snapshot: VersionSnapshot = {
      id: `snap_${Date.now()}_${++this.snapshotCounter}`,
      version: project.version || '1.0.0',
      timestamp: new Date().toISOString(),
      author,
      message,
      tags,
      branch: this.activeBranch,
      projectSnapshot: JSON.parse(JSON.stringify(project)),
      irSnapshot: ir,
      metadata: { componentCount: this.countProjectComponents(project) },
      parentId,
      childrenIds: [],
    };

    // Update parent's children
    if (parentId) {
      const parent = this.snapshots.find((s) => s.id === parentId);
      if (parent) {
        parent.childrenIds.push(snapshot.id);
      }
    }

    this.snapshots.push(snapshot);
    this.updateBranchHead(this.activeBranch, snapshot.id);

    studioEventBus.publish('VersionCreated', { snapshot });
    return snapshot;
  }

  getSnapshots(branch?: string): VersionSnapshot[] {
    let result = [...this.snapshots];
    if (branch) {
      result = result.filter((s) => s.branch === branch);
    }
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getSnapshot(id: string): VersionSnapshot | undefined {
    return this.snapshots.find((s) => s.id === id);
  }

  getLatestSnapshot(branch?: string): VersionSnapshot | null {
    const snapshots = this.getSnapshots(branch || this.activeBranch);
    return snapshots.length > 0 ? snapshots[0] : null;
  }

  restoreSnapshot(id: string): Project | null {
    const snapshot = this.snapshots.find((s) => s.id === id);
    if (!snapshot) return null;
    return JSON.parse(JSON.stringify(snapshot.projectSnapshot));
  }

  compareSnapshots(idA: string, idB: string): VersionDiff {
    const snapA = this.snapshots.find((s) => s.id === idA);
    const snapB = this.snapshots.find((s) => s.id === idB);
    if (!snapA || !snapB) {
      return {
        snapshotIdA: idA, snapshotIdB: idB,
        addedScreens: [], removedScreens: [], modifiedScreens: [],
        summary: { totalChanges: 0, screensAdded: 0, screensRemoved: 0, screensModified: 0, componentsAdded: 0, componentsRemoved: 0 },
      };
    }

    const screensA = snapA.projectSnapshot.screens;
    const screensB = snapB.projectSnapshot.screens;

    const mapA = new Map(screensA.map((s) => [s.id, s]));
    const mapB = new Map(screensB.map((s) => [s.id, s]));

    const addedScreens = screensB.filter((s) => !mapA.has(s.id)).map((s) => ({ id: s.id, name: s.name }));
    const removedScreens = screensA.filter((s) => !mapB.has(s.id)).map((s) => ({ id: s.id, name: s.name }));
    const modifiedScreens: VersionDiff['modifiedScreens'] = [];

    let componentsAdded = 0;
    let componentsRemoved = 0;

    screensB.forEach((screenB) => {
      const screenA = mapA.get(screenB.id);
      if (screenA) {
        const compsA = countComponents(screenA.components);
        const compsB = countComponents(screenB.components);
        const added = compsB - compsA;
        const removed = compsA - compsB;
        if (added > 0) componentsAdded += added;
        if (removed > 0) componentsRemoved += removed;

        if (added !== 0 || removed !== 0 || screenA.backgroundColor !== screenB.backgroundColor || screenA.name !== screenB.name) {
          const modifiedProps: string[] = [];
          if (screenA.backgroundColor !== screenB.backgroundColor) modifiedProps.push('backgroundColor');
          if (screenA.name !== screenB.name) modifiedProps.push('name');
          if (added !== 0) modifiedProps.push(`+${added} components`);
          if (removed !== 0) modifiedProps.push(`-${removed} components`);

          modifiedScreens.push({
            id: screenB.id,
            name: screenB.name,
            addedComponents: added > 0 ? added : 0,
            removedComponents: removed > 0 ? removed : 0,
            modifiedProperties: modifiedProps,
          });
        }
      }
    });

    return {
      snapshotIdA: idA,
      snapshotIdB: idB,
      addedScreens,
      removedScreens,
      modifiedScreens,
      summary: {
        totalChanges: addedScreens.length + removedScreens.length + modifiedScreens.length,
        screensAdded: addedScreens.length,
        screensRemoved: removedScreens.length,
        screensModified: modifiedScreens.length,
        componentsAdded,
        componentsRemoved,
      },
    };
  }

  // Branch Management
  getBranches(): Branch[] {
    return [...this.branches];
  }

  getBranch(name: string): Branch | undefined {
    return this.branches.find((b) => b.name === name);
  }

  getActiveBranchName(): string {
    return this.activeBranch;
  }

  setActiveBranch(name: string): boolean {
    const branch = this.branches.find((b) => b.name === name);
    if (!branch) return false;
    this.activeBranch = name;
    return true;
  }

  createBranch(name: string, sourceBranch?: string): Branch {
    const source = sourceBranch || this.activeBranch;
    const sourceBranchObj = this.getBranch(source);
    const headSnapshotId = sourceBranchObj?.headSnapshotId || '';

    const branch: Branch = {
      id: `branch_${Date.now()}`,
      name,
      description: `Branch criada a partir de ${source}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'user',
      headSnapshotId,
      isDefault: false,
      isProtected: false,
      sourceBranch: source,
    };

    this.branches.push(branch);
    return branch;
  }

  deleteBranch(name: string): boolean {
    const idx = this.branches.findIndex((b) => b.name === name);
    if (idx === -1 || this.branches[idx].isDefault || this.branches[idx].isProtected) return false;
    this.branches.splice(idx, 1);
    return true;
  }

  protectBranch(name: string, protect: boolean): boolean {
    const branch = this.branches.find((b) => b.name === name);
    if (!branch) return false;
    branch.isProtected = protect;
    return true;
  }

  // Tags
  addTag(snapshotId: string, tag: string): boolean {
    const snapshot = this.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) return false;
    if (!snapshot.tags.includes(tag)) {
      snapshot.tags.push(tag);
    }
    return true;
  }

  getSnapshotsByTag(tag: string): VersionSnapshot[] {
    return this.snapshots.filter((s) => s.tags.includes(tag));
  }

  // History
  getHistory(branch?: string, limit: number = 20): VersionSnapshot[] {
    return this.getSnapshots(branch).slice(0, limit);
  }

  getVersionCount(): number {
    return this.snapshots.length;
  }

  private updateBranchHead(branchName: string, snapshotId: string): void {
    const branch = this.branches.find((b) => b.name === branchName);
    if (branch) {
      branch.headSnapshotId = snapshotId;
      branch.updatedAt = new Date().toISOString();
    }
  }

  private countProjectComponents(project: Project): number {
    let count = 0;
    project.screens.forEach((screen) => {
      count += countComponents(screen.components);
    });
    return count;
  }
}

function countComponents(components: CanvasComponent[]): number {
  let count = 0;
  for (const comp of components) {
    count += 1;
    if (comp.children) {
      count += countComponents(comp.children);
    }
  }
  return count;
}

// ==========================================
// ETAPA 2 — COLLABORATION ENGINE (CRDT-based)
// ==========================================

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor?: { screenId: string; componentId?: string; x: number; y: number };
  selectedComponentIds: string[];
  lastSeen: string;
  isOnline: boolean;
}

export interface CollaborationOperation {
  id: string;
  userId: string;
  type: 'INSERT_COMPONENT' | 'UPDATE_PROPERTY' | 'DELETE_COMPONENT' | 'MOVE_COMPONENT' | 'REORDER' | 'ADD_SCREEN' | 'DELETE_SCREEN' | 'RENAME_SCREEN';
  timestamp: number;
  position?: number;
  data: any;
}

export interface CursorPosition {
  userId: string;
  screenId: string;
  componentId?: string;
  x: number;
  y: number;
}

export class CollaborationEngine {
  private collaborators: Map<string, Collaborator> = new Map();
  private operations: CollaborationOperation[] = [];
  private operationCounter = 0;
  private cursors: Map<string, CursorPosition> = new Map();
  private conflictLog: { operationId: string; resolved: boolean; strategy: string }[] = [];
  private lockMap: Map<string, string> = new Map(); // componentId -> userId

  join(name: string, email: string): Collaborator {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const colors = ['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6'];
    const color = colors[this.collaborators.size % colors.length];

    const collaborator: Collaborator = {
      id,
      name,
      email,
      color,
      selectedComponentIds: [],
      lastSeen: new Date().toISOString(),
      isOnline: true,
    };

    this.collaborators.set(id, collaborator);
    this.broadcastPresence();
    return collaborator;
  }

  leave(userId: string): void {
    const user = this.collaborators.get(userId);
    if (user) {
      user.isOnline = false;
      this.collaborators.set(userId, user);
    }
    // Release locks
    this.lockMap.forEach((lockedBy, componentId) => {
      if (lockedBy === userId) {
        this.lockMap.delete(componentId);
      }
    });
    this.broadcastPresence();
  }

  getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values()).filter((c) => c.isOnline);
  }

  getAllUsers(): Collaborator[] {
    return Array.from(this.collaborators.values());
  }

  updateCursor(userId: string, position: CursorPosition): void {
    this.cursors.set(userId, position);
    const user = this.collaborators.get(userId);
    if (user) {
      user.cursor = { screenId: position.screenId, componentId: position.componentId, x: position.x, y: position.y };
      user.lastSeen = new Date().toISOString();
    }
  }

  getCursors(): Map<string, CursorPosition> {
    return new Map(this.cursors);
  }

  // Operational Transformation (simplified CRDT)
  applyOperation(operation: Omit<CollaborationOperation, 'id' | 'timestamp'>): CollaborationOperation {
    const op: CollaborationOperation = {
      ...operation,
      id: `op_${Date.now()}_${++this.operationCounter}`,
      timestamp: Date.now(),
    };

    // Conflict detection
    const hasConflict = this.detectConflict(op);
    if (hasConflict) {
      const resolved = this.resolveConflict(op);
      this.conflictLog.push({
        operationId: op.id,
        resolved,
        strategy: resolved ? 'last_write_wins' : 'rejected',
      });
      if (!resolved) return op;
    }

    this.operations.push(op);
    studioEventBus.publish('CollaborationOperation', { operation: op });
    return op;
  }

  lockComponent(componentId: string, userId: string): boolean {
    const existingLock = this.lockMap.get(componentId);
    if (existingLock && existingLock !== userId) return false;
    this.lockMap.set(componentId, userId);
    return true;
  }

  unlockComponent(componentId: string, userId: string): boolean {
    const existingLock = this.lockMap.get(componentId);
    if (existingLock !== userId) return false;
    this.lockMap.delete(componentId);
    return true;
  }

  getLockedComponents(): Map<string, string> {
    return new Map(this.lockMap);
  }

  getOperationHistory(userId?: string): CollaborationOperation[] {
    if (userId) {
      return this.operations.filter((op) => op.userId === userId);
    }
    return [...this.operations];
  }

  getConflictLog(): { operationId: string; resolved: boolean; strategy: string }[] {
    return [...this.conflictLog];
  }

  private detectConflict(op: CollaborationOperation): boolean {
    // Simple conflict: two edits on same component within 100ms
    const recentOps = this.operations.filter(
      (existing) =>
        existing.data?.componentId === op.data?.componentId &&
        existing.userId !== op.userId &&
        Math.abs(existing.timestamp - op.timestamp) < 100 &&
        existing.type !== 'DELETE_COMPONENT'
    );
    return recentOps.length > 0;
  }

  private resolveConflict(op: CollaborationOperation): boolean {
    // Last-write-wins strategy
    return true;
  }

  private broadcastPresence(): void {
    studioEventBus.publish('CollaborationPresence', {
      online: this.getCollaborators().map((c) => ({ id: c.id, name: c.name, color: c.color })),
    });
  }

  getStats(): { onlineUsers: number; totalOperations: number; conflicts: number; lockedComponents: number } {
    return {
      onlineUsers: this.getCollaborators().length,
      totalOperations: this.operations.length,
      conflicts: this.conflictLog.length,
      lockedComponents: this.lockMap.size,
    };
  }
}

// ==========================================
// ETAPA 3 — TEAM WORKSPACE
// ==========================================

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'commenter';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  ownerId: string;
  plan: 'free' | 'pro' | 'enterprise';
  maxMembers: number;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: string;
  memberCount: number;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: TeamRole;
  joinedAt: string;
  organizationId: string;
  teamId?: string;
  projectPermissions: { projectId: string; role: TeamRole }[];
}

export class TeamWorkspaceManager {
  private organizations: Organization[] = [];
  private teams: Team[] = [];
  private members: TeamMember[] = [];
  private invitations: { id: string; email: string; organizationId: string; role: TeamRole; invitedBy: string; expiresAt: string; status: 'pending' | 'accepted' | 'declined' }[] = [];

  createOrganization(name: string, ownerId: string, plan: 'free' | 'pro' | 'enterprise' = 'free'): Organization {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const org: Organization = {
      id: `org_${Date.now()}`,
      name,
      slug,
      description: '',
      createdAt: new Date().toISOString(),
      ownerId,
      plan,
      maxMembers: plan === 'free' ? 5 : plan === 'pro' ? 25 : 100,
    };
    this.organizations.push(org);

    // Create default "General" team
    this.createTeam(org.id, 'General', 'Equipe geral');

    // Add owner as admin
    this.addMember(org.id, ownerId, 'admin', name || 'Owner');

    return org;
  }

  getOrganizations(userId: string): Organization[] {
    const userMemberships = this.members.filter((m) => m.userId === userId);
    return this.organizations.filter((o) => userMemberships.some((m) => m.organizationId === o.id));
  }

  getOrganization(id: string): Organization | undefined {
    return this.organizations.find((o) => o.id === id);
  }

  updateOrganization(id: string, data: Partial<Organization>): Organization | undefined {
    const org = this.organizations.find((o) => o.id === id);
    if (org) {
      Object.assign(org, data);
    }
    return org;
  }

  createTeam(organizationId: string, name: string, description: string = ''): Team {
    const team: Team = {
      id: `team_${Date.now()}`,
      organizationId,
      name,
      description,
      createdAt: new Date().toISOString(),
      memberCount: 0,
    };
    this.teams.push(team);
    return team;
  }

  getTeams(organizationId: string): Team[] {
    return this.teams.filter((t) => t.organizationId === organizationId);
  }

  addMember(organizationId: string, userId: string, role: TeamRole, name: string): TeamMember {
    const member: TeamMember = {
      id: `member_${Date.now()}`,
      userId,
      name,
      email: `${userId}@studio.app`,
      role,
      joinedAt: new Date().toISOString(),
      organizationId,
      projectPermissions: [],
    };
    this.members.push(member);

    // Update team member count
    const team = this.teams.find((t) => t.organizationId === organizationId);
    if (team) team.memberCount = this.getMembers(organizationId).length;

    return member;
  }

  removeMember(memberId: string): boolean {
    const idx = this.members.findIndex((m) => m.id === memberId);
    if (idx === -1) return false;
    this.members.splice(idx, 1);
    return true;
  }

  getMembers(organizationId: string): TeamMember[] {
    return this.members.filter((m) => m.organizationId === organizationId);
  }

  getMemberByUser(userId: string): TeamMember | undefined {
    return this.members.find((m) => m.userId === userId);
  }

  updateMemberRole(memberId: string, role: TeamRole): boolean {
    const member = this.members.find((m) => m.id === memberId);
    if (!member) return false;
    member.role = role;
    return true;
  }

  setProjectPermission(userId: string, projectId: string, role: TeamRole): boolean {
    const member = this.members.find((m) => m.userId === userId);
    if (!member) return false;
    const existing = member.projectPermissions.find((p) => p.projectId === projectId);
    if (existing) {
      existing.role = role;
    } else {
      member.projectPermissions.push({ projectId, role });
    }
    return true;
  }

  getProjectRole(userId: string, projectId: string): TeamRole | null {
    const member = this.members.find((m) => m.userId === userId);
    if (!member) return null;

    // Project-specific permission takes precedence
    const projectPerm = member.projectPermissions.find((p) => p.projectId === projectId);
    if (projectPerm) return projectPerm.role;

    return member.role;
  }

  getMaxMembers(organizationId: string): number {
    const org = this.organizations.find((o) => o.id === organizationId);
    return org?.maxMembers || 5;
  }

  canAddMember(organizationId: string): boolean {
    const currentCount = this.getMembers(organizationId).length;
    const max = this.getMaxMembers(organizationId);
    return currentCount < max;
  }

  inviteMember(organizationId: string, email: string, role: TeamRole, invitedBy: string): boolean {
    if (!this.canAddMember(organizationId)) return false;

    const invitation = {
      id: `inv_${Date.now()}`,
      email,
      organizationId,
      role,
      invitedBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
    };
    this.invitations.push(invitation);
    return true;
  }

  getInvitations(organizationId: string): typeof this.invitations {
    return this.invitations.filter((i) => i.organizationId === organizationId);
  }

  getStats(userId: string): { organizations: number; teams: number; members: number; invitations: number } {
    const orgs = this.getOrganizations(userId);
    return {
      organizations: orgs.length,
      teams: orgs.reduce((sum, o) => sum + this.getTeams(o.id).length, 0),
      members: orgs.reduce((sum, o) => sum + this.getMembers(o.id).length, 0),
      invitations: orgs.reduce((sum, o) => sum + this.getInvitations(o.id).length, 0),
    };
  }
}

// ==========================================
// ETAPA 4 — COMMENTS & REVIEWS
// ==========================================

export type CommentTargetType = 'screen' | 'component' | 'flow' | 'code' | 'project';

export interface Comment {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  targetName?: string;
  projectId: string;
  authorId: string;
  authorName: string;
  content: string;
  mentions: string[];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  replies: Comment[];
  attachments: { name: string; url: string }[];
}

export class CommentSystem {
  private comments: Comment[] = [];

  addComment(targetType: CommentTargetType, targetId: string, content: string, authorId: string, authorName: string, projectId: string, parentId?: string): Comment {
    const mentions = this.extractMentions(content);

    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      targetType,
      targetId,
      projectId,
      authorId,
      authorName,
      content,
      mentions,
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId,
      replies: [],
      attachments: [],
    };

    if (parentId) {
      const parent = this.findComment(parentId);
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      this.comments.push(comment);
    }

    // Notify mentioned users
    if (mentions.length > 0) {
      studioEventBus.publish('CollaborationMention', { mentions, comment });
    }

    return comment;
  }

  updateComment(commentId: string, content: string, userId: string): Comment | null {
    const comment = this.findComment(commentId);
    if (!comment || comment.authorId !== userId) return null;
    comment.content = content;
    comment.updatedAt = new Date().toISOString();
    return comment;
  }

  deleteComment(commentId: string, userId: string): boolean {
    const idx = this.comments.findIndex((c) => c.id === commentId);
    if (idx !== -1 && this.comments[idx].authorId === userId) {
      this.comments.splice(idx, 1);
      return true;
    }
    // Check in replies
    for (const comment of this.comments) {
      const replyIdx = comment.replies.findIndex((r) => r.id === commentId);
      if (replyIdx !== -1 && comment.replies[replyIdx].authorId === userId) {
        comment.replies.splice(replyIdx, 1);
        return true;
      }
    }
    return false;
  }

  resolveComment(commentId: string, userId: string): boolean {
    const comment = this.findComment(commentId);
    if (!comment) return false;
    comment.resolved = true;
    comment.resolvedBy = userId;
    comment.resolvedAt = new Date().toISOString();
    return true;
  }

  unresolveComment(commentId: string): boolean {
    const comment = this.findComment(commentId);
    if (!comment) return false;
    comment.resolved = false;
    comment.resolvedBy = undefined;
    comment.resolvedAt = undefined;
    return true;
  }

  getComments(targetType: CommentTargetType, targetId: string): Comment[] {
    return this.comments
      .filter((c) => c.targetType === targetType && c.targetId === targetId && !c.parentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

  getCommentsByAuthor(authorId: string): Comment[] {
    return this.comments.filter((c) => c.authorId === authorId);
  }

  getUnresolvedComments(projectId: string): Comment[] {
    return this.comments.filter((c) => c.projectId === projectId && !c.resolved && !c.parentId);
  }

  getCommentCount(): number {
    let count = this.comments.length;
    this.comments.forEach((c) => (count += c.replies.length));
    return count;
  }

  private findComment(id: string): Comment | undefined {
    const comment = this.comments.find((c) => c.id === id);
    if (comment) return comment;
    for (const c of this.comments) {
      const reply = c.replies.find((r) => r.id === id);
      if (reply) return reply;
    }
    return undefined;
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }
}

// ==========================================
// ETAPA 5 — GIT INTEGRATION
// ==========================================

export interface GitRemote {
  id: string;
  name: string;
  url: string;
  type: 'github' | 'gitlab' | 'bitbucket' | 'custom';
  authToken?: string;
  defaultBranch: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  branch: string;
  files: string[];
}

export interface GitStatus {
  branch: string;
  isClean: boolean;
  staged: string[];
  unstaged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

export class GitIntegration {
  private remotes: GitRemote[] = [];
  private commits: GitCommit[] = [];
  private localBranches: string[] = ['main', 'development'];
  private currentBranch = 'main';
  private stagedFiles: string[] = [];
  private modifiedFiles: string[] = [];

  addRemote(name: string, url: string, type: GitRemote['type'], authToken?: string): GitRemote {
    const remote: GitRemote = {
      id: `remote_${Date.now()}`,
      name,
      url,
      type,
      authToken,
      defaultBranch: 'main',
    };
    this.remotes.push(remote);
    return remote;
  }

  getRemotes(): GitRemote[] {
    return [...this.remotes];
  }

  removeRemote(id: string): boolean {
    const idx = this.remotes.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.remotes.splice(idx, 1);
    return true;
  }

  getStatus(): GitStatus {
    return {
      branch: this.currentBranch,
      isClean: this.stagedFiles.length === 0 && this.modifiedFiles.length === 0,
      staged: [...this.stagedFiles],
      unstaged: [...this.modifiedFiles],
      untracked: [],
      ahead: 0,
      behind: 0,
    };
  }

  stageFile(path: string): void {
    if (!this.stagedFiles.includes(path)) {
      this.stagedFiles.push(path);
      this.modifiedFiles = this.modifiedFiles.filter((f) => f !== path);
    }
  }

  unstageFile(path: string): void {
    this.stagedFiles = this.stagedFiles.filter((f) => f !== path);
    if (!this.modifiedFiles.includes(path)) {
      this.modifiedFiles.push(path);
    }
  }

  stageAll(): void {
    this.stagedFiles = [...this.stagedFiles, ...this.modifiedFiles];
    this.modifiedFiles = [];
  }

  commit(message: string, author: string): GitCommit {
    const files = [...this.stagedFiles];
    const commit: GitCommit = {
      hash: `commit_${Date.now().toString(16)}`,
      message,
      author,
      date: new Date().toISOString(),
      branch: this.currentBranch,
      files,
    };

    this.commits.push(commit);
    this.stagedFiles = [];

    studioEventBus.publish('GitCommitCreated', { commit });
    return commit;
  }

  getLog(branch?: string, limit: number = 50): GitCommit[] {
    let result = [...this.commits];
    if (branch) {
      result = result.filter((c) => c.branch === branch);
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
  }

  getBranches(): string[] {
    return [...this.localBranches];
  }

  getCurrentBranch(): string {
    return this.currentBranch;
  }

  checkout(branch: string): boolean {
    if (!this.localBranches.includes(branch)) return false;
    this.currentBranch = branch;
    return true;
  }

  createBranch(name: string, source?: string): boolean {
    if (this.localBranches.includes(name)) return false;
    this.localBranches.push(name);
    return true;
  }

  deleteBranch(name: string): boolean {
    const idx = this.localBranches.indexOf(name);
    if (idx === -1 || name === 'main') return false;
    this.localBranches.splice(idx, 1);
    return true;
  }

  merge(sourceBranch: string, targetBranch: string): { success: boolean; conflicts: string[]; commit?: GitCommit } {
    if (!this.localBranches.includes(sourceBranch) || !this.localBranches.includes(targetBranch)) {
      return { success: false, conflicts: ['Branch not found'] };
    }

    // Simulate merge
    const commit: GitCommit = {
      hash: `merge_${Date.now().toString(16)}`,
      message: `Merge branch '${sourceBranch}' into ${targetBranch}`,
      author: 'system',
      date: new Date().toISOString(),
      branch: targetBranch,
      files: [],
    };

    this.commits.push(commit);
    return { success: true, conflicts: [], commit };
  }

  // Push/Pull simulation
  push(remoteName: string): { success: boolean; message: string } {
    const remote = this.remotes.find((r) => r.name === remoteName);
    if (!remote) return { success: false, message: `Remote "${remoteName}" not found` };
    return { success: true, message: `Pushed ${this.commits.length} commits to ${remote.url}` };
  }

  pull(remoteName: string): { success: boolean; message: string } {
    const remote = this.remotes.find((r) => r.name === remoteName);
    if (!remote) return { success: false, message: `Remote "${remoteName}" not found` };
    return { success: true, message: `Pulled from ${remote.url}` };
  }

  clone(url: string, targetDir: string): { success: boolean; message: string } {
    const remote = this.addRemote('origin', url, 'custom');
    return { success: true, message: `Cloned ${url} to ${targetDir}` };
  }

  getCommitStats(): { total: number; byBranch: Record<string, number> } {
    const byBranch: Record<string, number> = {};
    this.commits.forEach((c) => {
      byBranch[c.branch] = (byBranch[c.branch] || 0) + 1;
    });
    return { total: this.commits.length, byBranch };
  }
}

// ==========================================
// ETAPA 6 — CI/CD PIPELINE
// ==========================================

export type PipelineStage = 'test' | 'validate' | 'build' | 'export' | 'deploy';

export interface PipelineConfig {
  id: string;
  name: string;
  description: string;
  triggers: {
    onCommit: boolean;
    onTag: boolean;
    onSchedule: boolean;
    schedule?: string; // cron
    manualOnly: boolean;
  };
  stages: {
    test: { enabled: boolean; commands: string[] };
    validate: { enabled: boolean; rules: string[] };
    build: { enabled: boolean; target: string[]; environment: string };
    export: { enabled: boolean; platforms: string[] };
    deploy: { enabled: boolean; target: string; autoDeploy: boolean };
  };
  notifications: {
    onSuccess: string[];
    onFailure: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  trigger: 'commit' | 'tag' | 'schedule' | 'manual';
  stages: {
    name: PipelineStage;
    status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
    startedAt?: string;
    completedAt?: string;
    durationMs: number;
    logs: string[];
  }[];
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  commit?: GitCommit;
  artifacts: { name: string; url: string; sizeKb: number }[];
}

export class CICDPipelineManager {
  private pipelines: PipelineConfig[] = [];
  private runs: PipelineRun[] = [];
  private runCounter = 0;

  createPipeline(config: Omit<PipelineConfig, 'id' | 'createdAt' | 'updatedAt'>): PipelineConfig {
    const pipeline: PipelineConfig = {
      ...config,
      id: `pipeline_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.pipelines.push(pipeline);
    return pipeline;
  }

  getPipelines(): PipelineConfig[] {
    return [...this.pipelines];
  }

  getPipeline(id: string): PipelineConfig | undefined {
    return this.pipelines.find((p) => p.id === id);
  }

  updatePipeline(id: string, config: Partial<PipelineConfig>): PipelineConfig | undefined {
    const pipeline = this.pipelines.find((p) => p.id === id);
    if (pipeline) {
      Object.assign(pipeline, config, { updatedAt: new Date().toISOString() });
    }
    return pipeline;
  }

  deletePipeline(id: string): boolean {
    const idx = this.pipelines.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.pipelines.splice(idx, 1);
    return true;
  }

  async triggerRun(pipelineId: string, trigger: PipelineRun['trigger'], commit?: GitCommit): Promise<PipelineRun> {
    const pipeline = this.pipelines.find((p) => p.id === pipelineId);
    if (!pipeline) throw new Error(`Pipeline "${pipelineId}" not found`);

    const startTime = Date.now();
    const stages: PipelineRun['stages'] = [
      { name: 'test', status: 'pending', durationMs: 0, logs: [] },
      { name: 'validate', status: 'pending', durationMs: 0, logs: [] },
      { name: 'build', status: 'pending', durationMs: 0, logs: [] },
      { name: 'export', status: 'pending', durationMs: 0, logs: [] },
      { name: 'deploy', status: 'pending', durationMs: 0, logs: [] },
    ];

    const run: PipelineRun = {
      id: `run_${Date.now()}_${++this.runCounter}`,
      pipelineId,
      status: 'running',
      trigger,
      stages,
      startedAt: new Date().toISOString(),
      durationMs: 0,
      commit,
      artifacts: [],
    };

    this.runs.unshift(run);

    // Execute stages sequentially
    const stageNames: PipelineStage[] = ['test', 'validate', 'build', 'export', 'deploy'];

    for (let i = 0; i < stageNames.length; i++) {
      const stageName = stageNames[i];
      const stageConfig = pipeline.stages[stageName];

      if (!stageConfig?.enabled) {
        stages[i].status = 'skipped';
        stages[i].logs = ['Etapa desabilitada na configuração'];
        continue;
      }

      stages[i].status = 'running';
      stages[i].startedAt = new Date().toISOString();
      stages[i].logs = [`Iniciando etapa: ${stageName}`];

      // Simulate execution time
      await this.delay(300 + Math.random() * 200);

      stages[i].status = 'success';
      stages[i].completedAt = new Date().toISOString();
      stages[i].durationMs = Date.now() - startTime;
      stages[i].logs.push(`✓ Etapa ${stageName} concluída com sucesso`);
    }

    // Check if all stages succeeded
    const allSuccess = stages.every((s) => s.status === 'success' || s.status === 'skipped');
    run.status = allSuccess ? 'success' : 'failed';
    run.completedAt = new Date().toISOString();
    run.durationMs = Date.now() - startTime;

    // Generate artifacts for export stage
    if (pipeline.stages.export.enabled && allSuccess) {
      pipeline.stages.export.platforms.forEach((platform) => {
        run.artifacts.push({
          name: `${platform}-build`,
          url: `#artifact_${platform}_${run.id}`,
          sizeKb: Math.floor(Math.random() * 15000) + 2000,
        });
      });
    }

    // Notifications
    const notifyList = allSuccess ? pipeline.notifications.onSuccess : pipeline.notifications.onFailure;
    if (notifyList.length > 0) {
      studioEventBus.publish('PipelineCompleted', { run, status: run.status, notify: notifyList });
    }

    return run;
  }

  getRuns(pipelineId?: string, limit: number = 20): PipelineRun[] {
    let result = [...this.runs];
    if (pipelineId) {
      result = result.filter((r) => r.pipelineId === pipelineId);
    }
    return result.slice(0, limit);
  }

  getRun(id: string): PipelineRun | undefined {
    return this.runs.find((r) => r.id === id);
  }

  getStats(): { totalPipelines: number; totalRuns: number; successRate: number; averageDurationMs: number } {
    const totalPipelines = this.pipelines.length;
    const totalRuns = this.runs.length;
    const successfulRuns = this.runs.filter((r) => r.status === 'success').length;
    const successRate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0;
    const averageDurationMs = totalRuns > 0
      ? Math.round(this.runs.reduce((sum, r) => sum + r.durationMs, 0) / totalRuns)
      : 0;

    return { totalPipelines, totalRuns, successRate, averageDurationMs };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==========================================
// ETAPA 7 — AUTOMATED PUBLISHING
// ==========================================

export interface PublishCredentials {
  googlePlay?: {
    serviceAccountJson: string;
    packageName: string;
  };
  appleStore?: {
    apiKeyId: string;
    apiKey: string;
    issuerId: string;
    bundleId: string;
  };
  web?: {
    hostingUrl: string;
    ftpHost?: string;
    ftpUser?: string;
  };
}

export interface PublishConfig {
  id: string;
  name: string;
  platform: 'android' | 'ios' | 'web';
  credentials: PublishCredentials;
  track: 'internal' | 'alpha' | 'beta' | 'production';
  autoPublish: boolean;
  lastPublished?: string;
  lastVersion?: string;
}

export class PublishingManager {
  private configs: PublishConfig[] = [];
  private publishHistory: { configId: string; version: string; timestamp: string; status: 'success' | 'failed'; platform: string; track: string }[] = [];

  createConfig(config: Omit<PublishConfig, 'id'>): PublishConfig {
    const newConfig: PublishConfig = {
      ...config,
      id: `pub_${Date.now()}`,
    };
    this.configs.push(newConfig);
    return newConfig;
  }

  getConfigs(): PublishConfig[] {
    return [...this.configs];
  }

  getConfig(id: string): PublishConfig | undefined {
    return this.configs.find((c) => c.id === id);
  }

  updateConfig(id: string, data: Partial<PublishConfig>): PublishConfig | undefined {
    const config = this.configs.find((c) => c.id === id);
    if (config) {
      Object.assign(config, data);
    }
    return config;
  }

  deleteConfig(id: string): boolean {
    const idx = this.configs.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.configs.splice(idx, 1);
    return true;
  }

  async publish(configId: string, version: string): Promise<{ success: boolean; message: string }> {
    const config = this.configs.find((c) => c.id === configId);
    if (!config) return { success: false, message: 'Configuração não encontrada' };

    // Simulate publishing
    await this.delay(500);

    const status: 'success' | 'failed' = Math.random() > 0.1 ? 'success' : 'failed';

    this.publishHistory.push({
      configId,
      version,
      timestamp: new Date().toISOString(),
      status,
      platform: config.platform,
      track: config.track,
    });

    if (status === 'success') {
      config.lastPublished = new Date().toISOString();
      config.lastVersion = version;
      studioEventBus.publish('AppPublished', { config, version });
      return { success: true, message: `Publicado com sucesso na ${config.platform} (${config.track}) v${version}` };
    }

    return { success: false, message: 'Falha na publicação. Verifique as credenciais.' };
  }

  getHistory(limit: number = 20): typeof this.publishHistory {
    return [...this.publishHistory].reverse().slice(0, limit);
  }

  getStats(): { totalConfigs: number; totalPublishes: number; successRate: number; lastPublish?: string } {
    const totalPublishes = this.publishHistory.length;
    const successCount = this.publishHistory.filter((p) => p.status === 'success').length;
    const successRate = totalPublishes > 0 ? Math.round((successCount / totalPublishes) * 100) : 0;
    const lastPublish = this.publishHistory.length > 0 ? this.publishHistory[this.publishHistory.length - 1].timestamp : undefined;

    return {
      totalConfigs: this.configs.length,
      totalPublishes,
      successRate,
      lastPublish,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==========================================
// ETAPA 8 — MONITORING DASHBOARD
// ==========================================

export interface MonitoringMetrics {
  builds: { total: number; success: number; failed: number; averageDurationMs: number };
  tests: { total: number; passed: number; failed: number; coverage: number };
  deployments: { total: number; success: number; failed: number };
  performance: {
    averageBuildTimeMs: number;
    averageExportTimeMs: number;
    averageValidationTimeMs: number;
    totalStorageKb: number;
  };
  activity: {
    activeUsers: number;
    dailyCommits: number;
    recentErrors: { message: string; timestamp: string; severity: string }[];
  };
}

export class MonitoringDashboard {
  private metricsHistory: MonitoringMetrics[] = [];
  private errors: { message: string; timestamp: string; severity: 'error' | 'warning' | 'info'; source: string }[] = [];

  recordError(message: string, severity: 'error' | 'warning' | 'info', source: string): void {
    this.errors.push({ message, timestamp: new Date().toISOString(), severity, source });
    if (this.errors.length > 1000) this.errors.shift();
  }

  getErrors(limit: number = 50, severity?: string): typeof this.errors {
    let result = [...this.errors].reverse();
    if (severity) {
      result = result.filter((e) => e.severity === severity);
    }
    return result.slice(0, limit);
  }

  recordMetrics(metrics: MonitoringMetrics): void {
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > 100) this.metricsHistory.shift();
  }

  getCurrentMetrics(): MonitoringMetrics {
    if (this.metricsHistory.length > 0) {
      return { ...this.metricsHistory[this.metricsHistory.length - 1] };
    }
    return this.getEmptyMetrics();
  }

  getMetricsHistory(): MonitoringMetrics[] {
    return [...this.metricsHistory];
  }

  getAverageMetrics(): MonitoringMetrics {
    if (this.metricsHistory.length === 0) return this.getEmptyMetrics();

    const sumMetric = (key: string): number => {
      return Math.round(this.metricsHistory.reduce((sum, m) => sum + ((m.builds as any)[key] as number), 0) / this.metricsHistory.length);
    };

    return {
      builds: {
        total: sumMetric('total'),
        success: sumMetric('success'),
        failed: sumMetric('failed'),
        averageDurationMs: sumMetric('averageDurationMs'),
      },
      tests: {
        total: sumMetric('total'),
        passed: sumMetric('passed'),
        failed: sumMetric('failed'),
        coverage: Math.round(this.metricsHistory.reduce((sum, m) => sum + m.tests.coverage, 0) / this.metricsHistory.length),
      },
      deployments: {
        total: sumMetric('total'),
        success: sumMetric('success'),
        failed: sumMetric('failed'),
      },
      performance: {
        averageBuildTimeMs: Math.round(this.metricsHistory.reduce((sum, m) => sum + m.performance.averageBuildTimeMs, 0) / this.metricsHistory.length),
        averageExportTimeMs: Math.round(this.metricsHistory.reduce((sum, m) => sum + m.performance.averageExportTimeMs, 0) / this.metricsHistory.length),
        averageValidationTimeMs: Math.round(this.metricsHistory.reduce((sum, m) => sum + m.performance.averageValidationTimeMs, 0) / this.metricsHistory.length),
        totalStorageKb: Math.round(this.metricsHistory.reduce((sum, m) => sum + m.performance.totalStorageKb, 0) / this.metricsHistory.length),
      },
      activity: {
        activeUsers: 0,
        dailyCommits: 0,
        recentErrors: this.getErrors(10),
      },
    };
  }

  private getEmptyMetrics(): MonitoringMetrics {
    return {
      builds: { total: 0, success: 0, failed: 0, averageDurationMs: 0 },
      tests: { total: 0, passed: 0, failed: 0, coverage: 0 },
      deployments: { total: 0, success: 0, failed: 0 },
      performance: { averageBuildTimeMs: 0, averageExportTimeMs: 0, averageValidationTimeMs: 0, totalStorageKb: 0 },
      activity: { activeUsers: 0, dailyCommits: 0, recentErrors: [] },
    };
  }
}

// ==========================================
// ETAPA 9 — AUDIT & SECURITY
// ==========================================

export type AuditActionType =
  | 'PROJECT_CREATED' | 'PROJECT_UPDATED' | 'PROJECT_DELETED'
  | 'VERSION_CREATED' | 'VERSION_RESTORED' | 'BRANCH_CREATED' | 'BRANCH_DELETED'
  | 'COMMENT_ADDED' | 'COMMENT_RESOLVED'
  | 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'MEMBER_ROLE_CHANGED'
  | 'GIT_COMMIT' | 'GIT_PUSH' | 'GIT_PULL' | 'GIT_MERGE'
  | 'PIPELINE_TRIGGERED' | 'PIPELINE_COMPLETED'
  | 'PUBLISH_STARTED' | 'PUBLISH_COMPLETED'
  | 'PERMISSION_CHANGED' | 'LOGIN' | 'LOGOUT' | 'EXPORT_STARTED';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditActionType;
  resourceType: string;
  resourceId: string;
  details: string;
  metadata: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export class AuditLogger {
  private entries: AuditEntry[] = [];
  private maxEntries = 10000;

  log(action: AuditActionType, userId: string, userName: string, resourceType: string, resourceId: string, details: string, metadata: Record<string, any> = {}): AuditEntry {
    const entry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      resourceType,
      resourceId,
      details,
      metadata,
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    return entry;
  }

  getEntries(options: { userId?: string; action?: AuditActionType; resourceType?: string; limit?: number } = {}): AuditEntry[] {
    let result = [...this.entries];
    if (options.userId) result = result.filter((e) => e.userId === options.userId);
    if (options.action) result = result.filter((e) => e.action === options.action);
    if (options.resourceType) result = result.filter((e) => e.resourceType === options.resourceType);
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, options.limit || 50);
  }

  getEntriesByDateRange(startDate: string, endDate: string, limit: number = 100): AuditEntry[] {
    return this.entries
      .filter((e) => e.timestamp >= startDate && e.timestamp <= endDate)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getEntryCountByAction(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.entries.forEach((e) => {
      counts[e.action] = (counts[e.action] || 0) + 1;
    });
    return counts;
  }

  getEntryCountByUser(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.entries.forEach((e) => {
      counts[e.userName] = (counts[e.userName] || 0) + 1;
    });
    return counts;
  }

  getTotalEntries(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries = [];
  }
}

// ==========================================
// ETAPA 10 — IR UPDATE (metadata extension)
// ==========================================

export type { IRCollaborationMeta } from './irCompiler';

export function extendIRWithCollaborationMeta(
  ir: StudioIR,
  vcs: VersionControlEngine,
  comments: CommentSystem,
  pipeline?: CICDPipelineManager,
  publish?: PublishingManager,
  audit?: AuditLogger
): StudioIR {
  const snapshot = vcs.getLatestSnapshot();
  const commentCount = comments.getCommentCount();
  const unresolvedComments = comments.getUnresolvedComments(ir.appInfo.id || 'project').length;
  const branches = vcs.getBranches().map((b) => ({ name: b.name, headSnapshotId: b.headSnapshotId }));

  return {
    ...ir,
    collaborationMeta: {
      versionHistory: {
        snapshotCount: vcs.getVersionCount(),
        lastSnapshotId: snapshot?.id,
        branches,
      },
      collaborators: [],
      comments: {
        total: commentCount,
        unresolved: unresolvedComments,
        lastActivity: snapshot?.timestamp || new Date().toISOString(),
      },
      pipeline: {
        configured: pipeline ? pipeline.getPipelines().length > 0 : false,
        lastRunStatus: pipeline ? pipeline.getRuns()[0]?.status : undefined,
        lastRunAt: pipeline ? pipeline.getRuns()[0]?.completedAt : undefined,
      },
      deploy: {
        configured: publish ? publish.getConfigs().length > 0 : false,
        lastPublishedAt: publish?.getStats().lastPublish,
        lastVersion: publish?.getConfigs()[0]?.lastVersion,
      },
      audit: {
        totalActions: audit?.getTotalEntries() || 0,
      },
    },
  };
}

// ==========================================
// MAIN COLLABORATION & DEVOPS PLATFORM
// ==========================================

export class CollaborationDevOpsPlatform {
  public versionControl = new VersionControlEngine();
  public collaboration = new CollaborationEngine();
  public teamWorkspace = new TeamWorkspaceManager();
  public comments = new CommentSystem();
  public git = new GitIntegration();
  public pipeline = new CICDPipelineManager();
  public publishing = new PublishingManager();
  public monitoring = new MonitoringDashboard();
  public audit = new AuditLogger();

  getCollaborationMeta(ir: StudioIR): IRCollaborationMeta {
    return extendIRWithCollaborationMeta(
      ir,
      this.versionControl,
      this.comments,
      this.pipeline,
      this.publishing,
      this.audit
    ).collaborationMeta!;
  }

  extendIR(ir: StudioIR): StudioIR {
    return extendIRWithCollaborationMeta(ir, this.versionControl, this.comments, this.pipeline, this.publishing, this.audit);
  }

  getDashboardData() {
    return {
      versionControl: {
        snapshots: this.versionControl.getVersionCount(),
        branches: this.versionControl.getBranches().length,
        activeBranch: this.versionControl.getActiveBranchName(),
        latestSnapshot: this.versionControl.getLatestSnapshot()?.timestamp,
      },
      collaboration: this.collaboration.getStats(),
      team: this.teamWorkspace.getStats('current'),
      comments: {
        total: this.comments.getCommentCount(),
        unresolved: this.comments.getUnresolvedComments('project').length,
      },
      git: {
        ...this.git.getCommitStats(),
        currentBranch: this.git.getCurrentBranch(),
        isClean: this.git.getStatus().isClean,
      },
      pipeline: this.pipeline.getStats(),
      publishing: this.publishing.getStats(),
      monitoring: {
        errors: this.monitoring.getErrors(5),
        currentMetrics: this.monitoring.getCurrentMetrics(),
      },
      audit: {
        totalEntries: this.audit.getTotalEntries(),
        recentActions: this.audit.getEntries({ limit: 10 }),
      },
    };
  }
}

export const devopsPlatform = new CollaborationDevOpsPlatform();
