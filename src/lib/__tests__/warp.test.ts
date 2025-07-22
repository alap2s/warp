import { createWarp, getWarp, deleteWarp, updateWarp, joinWarp, leaveWarp, getWarpsByOwner } from '../warp';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const projectId = 'dots-test';
let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: 'localhost',
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Warp Functions', () => {
  it('should create a new warp and retrieve it', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      const warpData = {
        what: 'Test Warp',
        when: new Date(),
        where: 'Test Location',
        icon: 'test-icon',
        ownerId: 'alice',
      };
      const warpId = await createWarp(warpData);
      expect(warpId).toBeDefined();

      const retrievedWarp = await getWarp(warpId!);
      expect(retrievedWarp).toBeDefined();
      expect(retrievedWarp!.what).toBe(warpData.what);
    });
  });
});
