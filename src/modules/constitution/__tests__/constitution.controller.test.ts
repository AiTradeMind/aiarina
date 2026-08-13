import { ConstitutionController } from "../controllers/constitution.controller.ts";
import { Request, Response } from "express";

/**
 * Controller Tests for ConstitutionController
 */
export async function runConstitutionControllerTests(): Promise<{ passed: boolean; results: string[] }> {
  const results: string[] = [];
  let passed = true;

  const mockRes = (): { res: Partial<Response>; statusCode: number; jsonBody: any } => {
    const responseObj: any = {
      statusCode: 200,
      jsonBody: null,
    };
    const res: Partial<Response> = {
      status: (code: number) => {
        responseObj.statusCode = code;
        return res as Response;
      },
      json: (data: any) => {
        responseObj.jsonBody = data;
        return res as Response;
      },
    };
    return { res, get statusCode() { return responseObj.statusCode; }, get jsonBody() { return responseObj.jsonBody; } };
  };

  try {
    const controller = new ConstitutionController();

    // Test 1: getConstitution
    const mock1 = mockRes();
    const req1 = {} as Request;
    await controller.getConstitution(req1, mock1.res as Response, () => {});
    if (mock1.statusCode === 200 && mock1.jsonBody?.success === true) {
      results.push("[PASS] Controller.getConstitution returned 200 success");
    } else {
      passed = false;
      results.push(`[FAIL] Controller.getConstitution status: ${mock1.statusCode}`);
    }

    // Test 2: getVersion
    const mock2 = mockRes();
    const req2 = {} as Request;
    await controller.getVersion(req2, mock2.res as Response, () => {});
    if (mock2.statusCode === 200 && mock2.jsonBody?.success === true) {
      results.push("[PASS] Controller.getVersion returned 200 success");
    } else {
      passed = false;
      results.push(`[FAIL] Controller.getVersion status: ${mock2.statusCode}`);
    }

    // Test 3: getModules
    const mock3 = mockRes();
    const req3 = {} as Request;
    await controller.getModules(req3, mock3.res as Response, () => {});
    if (mock3.statusCode === 200 && mock3.jsonBody?.success === true) {
      results.push("[PASS] Controller.getModules returned 200 success");
    } else {
      passed = false;
      results.push(`[FAIL] Controller.getModules status: ${mock3.statusCode}`);
    }

    // Test 4: registerModule validation failure
    const mock4 = mockRes();
    const req4 = { body: {} } as Request;
    await controller.registerModule(req4, mock4.res as Response, () => {});
    if (mock4.statusCode === 400 && mock4.jsonBody?.success === false) {
      results.push("[PASS] Controller.registerModule validation caught missing parameters");
    } else {
      passed = false;
      results.push(`[FAIL] Controller.registerModule expected 400 validation error but got ${mock4.statusCode}`);
    }

    // Test 5: registerModule success
    const mock5 = mockRes();
    const req5 = {
      body: {
        moduleId: "MOD-CTRL-TEST",
        moduleName: "Controller Test Module",
        version: "1.0.0",
      },
      user: { email: "admin@aiarena.local", role: "admin" },
    } as any;
    await controller.registerModule(req5, mock5.res as Response, () => {});
    if (mock5.statusCode === 201 && mock5.jsonBody?.success === true) {
      results.push("[PASS] Controller.registerModule created module with 201 status");
    } else {
      passed = false;
      results.push(`[FAIL] Controller.registerModule expected 201 but got ${mock5.statusCode}`);
    }

  } catch (error: any) {
    passed = false;
    results.push(`[ERROR] Controller test exception: ${error.message}`);
  }

  return { passed, results };
}
