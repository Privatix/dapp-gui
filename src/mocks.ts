const mocks = [
    {endpoint: /\/logs/, method: 'get', res: [{severity: 'warning', date: '5:30 PM 09-Apr-18', event: 'low balance'}, {severity: 'error', date: '5:30 PM 09-Apr-18', event: 'connection error'}, {severity: 'info', date: '5:30 PM 09-Apr-18', event: 'channel created'}]}
   ,{endpoint: /\/auth/, method: 'post', res: [true]}
   ,{endpoint: /\/accounts/, method: 'get', res: [{id: '0815b4d3-f442-4c06-aff3-fbe868ed242a', name: 'test account', ethAddr: '17E5DEB23d5a0ca1379d1d240cD9ba54EbEE4c63', ethBalance: 100000, ptcBalance: 4573, pscBalance: 893, inUse: true, isDefault: true}]}
   ,{endpoint: /\/accounts/, method: 'post', res: [true]}
   ,{endpoint: /\/transactions/, method: 'get', res: [{date: 'some date', ethAddr: '17E5DEB23d5a0ca1379d1d240cD9ba54EbEE4c63'}, {date: 'another date', ethAddr: '17E5DEB23d5a0ca1379d1d240cD9ba54EbEE4c63'}]}
//   ,{endpoint: /\/accounts/, method: 'post', res: [true]}
/*   ,{endpoint: /\/templates/, method: 'get', res: [ { id: '0815b4d3-f442-4c06-aff3-fbe868ed242a',
    hash: '                                            ',
    raw: 'ewogICAgInNjaGVtYSI6IHsKICAgICAgInRpdGxlIjogIlZQTiBTZXJ2aWNlIE9mZmVyaW5nIiwKICAgICAgInR5cGUiOiAib2JqZWN0IiwKICAgICAgInJlcXVpcmVkIjogWwogICAgICAgICAgInNlcnZpY2VOYW1lIgogICAgICAgICAsInN1cHBseSIKICAgICAgICAgLCJ1bml0TmFtZSIKICAgICAgICAgLCJ1bml0VHlwZSIKICAgICAgICAgLCJiaWxsaW5nVHlwZSIKICAgICAgICAgLCJzZXR1cFByaWNlIgogICAgICAgICAsInVuaXRQcmljZSIKICAgICAgICAgLCJjb3VudHJ5IgogICAgICAgICAsIm1pblVuaXRzIgogICAgICAgICAsImJpbGxpbmdJbnRlcnZhbCIKICAgICAgICAgLCJtYXhCaWxsaW5nVW5pdExhZyIKICAgICAgICAgLCJmcmVlVW5pdHMiCiAgICAgICAgICwidGVtcGxhdGUiCiAgICAgICAgICwicHJvZHVjdCIKICAgICAgICAgLCJhZ2VudCIKICAgICAgICAgLCJhZGRpdGlvbmFsUGFyYW1zIgogICAgICAgICAsIm1heFN1c3BlbmRUaW1lIgogICAgICBdLAogICAgICAicHJvcGVydGllcyI6IHsKICAgICAgICAic2VydmljZU5hbWUiOiB7InR5cGUiOiAic3RyaW5nIiwgInRpdGxlIjogIk5hbWUgb2Ygc2VydmljZSAoZS5nLiBWUE4pIn0sCiAgICAgICAgInN1cHBseSI6IHsidHlwZSI6ICJudW1iZXIiLCAidGl0bGUiOiAic2VydmljZSBzdXBwbHkifSwKICAgICAgICAidW5pdE5hbWUiOiB7InR5cGUiOiAic3RyaW5nIiwgInRpdGxlIjogImxpa2UgbWVnYWJ5dGVzLCBtaW51dGVzLCBldGMifSwKICAgICAgICAidW5pdFR5cGUiOiB7InR5cGUiOiAibnVtYmVyIiwgInRpdGxlIjogInNlcnZpY2UgdW5pdCJ9LAogICAgICAgICJiaWxsaW5nVHlwZSI6IHsidHlwZSI6ICJzdHJpbmciLCAiZW51bSI6IFsicHJlcGFpZCIsICJwb3N0cGFpZCJdLCIgZW51bU5hbWVzIjogWyJwcmVwYWlkIiwgInBvc3RwYWlkIl0sICJ0aXRsZSI6ICJiaWxsaW5nIHR5cGUifSwKICAgICAgICAic2V0dXBQcmljZSI6IHsidHlwZSI6ICJudW1iZXIiLCAidGl0bGUiOiAic2V0dXAgZmVlIn0sCiAgICAgICAgInVuaXRQcmljZSI6IHsidHlwZSI6ICJudW1iZXIiLCAidGl0bGUiOiAidW5pdCBwcmljZSJ9LAogICAgICAgICJjb3VudHJ5IjogeyJ0eXBlIjogInN0cmluZyIsICJ0aXRsZSI6ICJjb3VudHJ5In0sCiAgICAgICAgIm1pblVuaXRzIjogeyJ0eXBlIjogIm51bWJlciIsICJ0aXRsZSI6ICJtaW4gdW5pdHMifSwKICAgICAgICAiYmlsbGluZ0ludGVydmFsIjogeyJ0eXBlIjogIm51bWJlciIsICJ0aXRsZSI6ICJiaWxsaW5nIGludGVydmFsIn0sCiAgICAgICAgIm1heEJpbGxpbmdVbml0TGFnIjogeyJ0eXBlIjogIm51bWJlciIsICJ0aXRsZSI6ICJtYXggYmlsbGluZyB1bml0IGxhZyJ9LAogICAgICAgICJmcmVlVW5pdHMiOiB7InR5cGUiOiAibnVtYmVyIiwgInRpdGxlIjogImZyZWUgdW5pdHMifSwKICAgICAgICAidGVtcGxhdGUiOiB7InR5cGUiOiAic3RyaW5nIiwgImRlZmF1bHQiOiAiMSJ9LAogICAgICAgICJwcm9kdWN0IjogeyJ0eXBlIjogInN0cmluZyIsICJkZWZhdWx0IjogIjEifSwKICAgICAgICAiYWdlbnQiOiB7InR5cGUiOiAic3RyaW5nIiwgInRpdGxlIjogImFnZW50IHV1aWQifSwKICAgICAgICAiYWRkaXRpb25hbFBhcmFtcyI6IHsidHlwZSI6ICJzdHJpbmciLCAiZGVmYXVsdCI6ICJ7fSJ9LAogICAgICAgICJtYXhTdXNwZW5kVGltZSI6IHsidHlwZSI6ICJudW1iZXIiLCAidGl0bGUiOiAibWF4IHN1c3BlbmQgdGltZSJ9CiAgICAgIH0KICAgIH0sCiAgICAidWlTY2hlbWEiOiB7CiAgICAgICAgInNlcnZpY2VOYW1lIjogeyJ1aTpoZWxwIjogImVudGVyIG5hbWUgb2Ygc2VydmljZSJ9LAogICAgICAgICJzdXBwbHkiOiB7InVpOmhlbHAiOiAiTWF4aW11bSBzdXBwbHkgb2Ygc2VydmljZXMgYWNjb3JkaW5nIHRvIHNlcnZpY2Ugb2ZmZXJpbmdzLiBJdCByZXByZXNlbnRzIG1heGltdW0gbnVtYmVyIG9mIGNsaWVudHMgdGhhdCBjYW4gY29uc3VtZSB0aGlzIHNlcnZpY2Ugb2ZmZXJpbmcgY29uY3VycmVudGx5LiJ9LAogICAgICAgICJ1bml0TmFtZSI6IHsidWk6aGVscCI6ICJNQi9NaW51dGVzIn0sCiAgICAgICAgInVuaXRUeXBlIjogeyJ1aTpoZWxwIjogInVuaXRzIG9yIHNlY29uZHMifSwKICAgICAgICAiYmlsbGluZ1R5cGUiOiB7InVpOmhlbHAiOiAicHJlcGFpZC9wb3N0cGFpZCJ9LAogICAgICAgICJzZXR1cFByaWNlIjogeyJ1aTpoZWxwIjogInNldHVwIGZlZSJ9LAogICAgICAgICJ1bml0UHJpY2UiOiB7InVpOmhlbHAiOiAiUFJJWCB0aGF0IG11c3QgYmUgcGFpZCBmb3IgdW5pdF9vZl9zZXJ2aWNlIn0sCiAgICAgICAgImNvdW50cnkiOiB7InVpOmhlbHAiOiAiQ291bnRyeSBvZiBzZXJ2aWNlIGVuZHBvaW50IGluIElTTyAzMTY2LTEgYWxwaGEtMiBmb3JtYXQuIn0sCiAgICAgICAgIm1pblVuaXRzIjogeyJ1aTpoZWxwIjogIlVzZWQgdG8gY2FsY3VsYXRlIG1pbmltdW0gZGVwb3NpdCByZXF1aXJlZCJ9LAogICAgICAgICJiaWxsaW5nSW50ZXJ2YWwiOiB7InVpOmhlbHAiOiAiU3BlY2lmaWVkIGluIHVuaXRfb2Zfc2VydmljZS4gUmVwcmVzZW50LCBob3cgb2Z0ZW4gQ2xpZW50IE1VU1QgcHJvdmlkZSBwYXltZW50IGFwcHJvdmFsIHRvIEFnZW50LiJ9LAogICAgICAgICJtYXhCaWxsaW5nVW5pdExhZyI6IHsidWk6aGVscCI6ICJNYXhpbXVtIHBheW1lbnQgbGFnIGluIHVuaXRzIGFmdGVyLCB3aGljaCBBZ2VudCB3aWxsIHN1c3BlbmQgc2VydmljZSB1c2FnZS4ifSwKICAgICAgICAiZnJlZVVuaXRzIjogeyJ1aTpoZWxwIjogIlVzZWQgdG8gZ2l2ZSBmcmVlIHRyaWFsLCBieSBzcGVjaWZ5aW5nIGhvdyBtYW55IGludGVydmFscyBjYW4gYmUgY29uc3VtZWQgd2l0aG91dCBwYXltZW50In0sCiAgICAgICAgInRlbXBsYXRlIjogeyJ1aTp3aWRnZXQiOiAiaGlkZGVuIn0sCiAgICAgICAgInByb2R1Y3QiOiB7InVpOndpZGdldCI6ICJoaWRkZW4ifSwKICAgICAgICAiYWdlbnQiOiB7InVpOndpZGdldCI6ICJoaWRkZW4ifSwKICAgICAgICAiYWRkaXRpb25hbFBhcmFtcyI6IHsidWk6d2lkZ2V0IjogImhpZGRlbiJ9LAogICAgICAgICJtYXhTdXNwZW5kVGltZSI6IHsidWk6aGVscCI6ICJNYXhpbXVtIHRpbWUgd2l0aG91dCBzZXJ2aWNlIHVzYWdlLiBBZ2VudCB3aWxsIGNvbnNpZGVyLCB0aGF0IENsaWVudCB3aWxsIG5vdCB1c2Ugc2VydmljZSBhbmQgc3RvcCBwcm92aWRpbmcgaXQuIFBlcmlvZCBpcyBzcGVjaWZpZWQgaW4gbWludXRlcy4ifQogICAgfQp9Cg==',
    kind: 'offer' },
  { id: '362acc10-6ef2-4339-839c-ff77ee213a62',
    hash: '                                            ',
    raw: 'eyJzY2hlbWEiOiB7InRpdGxlIjogImVuZHBvaW50IHRlbXBsYXRlIn19',
    kind: 'access' } ]}
   ,{endpoint: /\/templates\?/, method: 'get', res: [
   { id: '0815b4d3-f442-4c06-aff3-fbe868ed242a',
    hash: '                                            ',
    raw: 'ewogICAgInNjaGVtYSI6IHsKICAgICAgInRpdGxlIjogIlZQTiBTZXJ2aWNlIE9mZmVyaW5nIiwKICAgICAgInR5cGUiOiAib2JqZWN0IiwKICAgICAgInJlcXVpcmVkIjogWwogICAgICAgICAgInNlcnZpY2VOYW1lIgogICAgICAgICAsInN1cHBseSIKICAgICAgICAgLCJ1bml0TmFtZSIKICAgICAgICAgLCJ1bml0VHlwZSIKICAgICAgICAgLCJiaWxsaW5nVHlwZSIKICAgICAgICAgLCJzZXR1cFByaWNlIgogICAgICAgICAsInVuaXRQcmljZSIKICAgICAgICAgLCJjb3VudHJ5IgogICAgICAgICAsIm1pblVuaXRzIgogICAgICAgICAsImJpbGxpbmdJbnRlcnZhbCIKICAgICAgICAgLCJtYXhCaWxsaW5nVW5pdExhZyIKICAgICAgICAgLCJmcmVlVW5pdHMiCiAgICAgICAgICwidGVtcGxhdGUiCiAgICAgICAgICwicHJvZHVjdCIKICAgICAgICAgLCJhZ2VudCIKICAgICAgICAgLCJhZGRpdGlvbmFsUGFyYW1zIgogICAgICAgICAsIm1heFN1c3BlbmRUaW1lIgogICAgICBdLAogICAgICAicHJvcGVydGllcyI6IHsKICAgICAgICAic2VydmljZU5hbWUiOiB7InR5cGUiOiAic3RyaW5nIiwgInRpdGxlIjogIk5hbWUgb2Ygc2VydmljZSAoZS5nLiBWUE4pIn0sCiAgICAgICAgInN1cHBseSI6IHsidHlwZSI6ICJudW1iZXIiLCAidGl0bGUiOiAic2VydmljZSBzdXBwbHkifSwKICAgICAgICAidW5pdE5hbWUiOiB7InR5cGUiOiAic3RyaW5nIiwgInRpdGxlIjogImxpa2UgbWVnYWJ5dGVzLCBtaW51dGVzLCBldGMifSwKICAgICAgICAidW5pdFR5cGUiOiB7InR5cGUiOiAibnVtYmVyIiwgInRpdGxlIjogInNlcnZpY2UgdW5pdCJ9LAogICAgICAgICJiaWxsaW5nVHlwZSI6IHsidHlwZSI6ICJzdHJpbmciLCAiZW51bSI6IFsicHJlcGFpZCIsICJwb3N0cGFpZCJdLCIgZW51bU5hbWVzIjogWyJwcmVwYWlkIiwgInBvc3RwYWlkIl0sICJ0aXRsZSI6ICJiaWxsaW5nIHR5cGUifSwKICAgICAgICAic2V0dXBQcmljZSI6IHsidHlwZSI6ICJudW1iZXIiLCAidGl0bGUiOiAic2V0dXAgZmVlIn0sCiAgICAgICAgInVuaXRQcmljZSI6IHsidHlwZSI6ICJudW1iZXIiLCAidGl0bGUiOiAidW5pdCBwcmljZSJ9LAogICAgICAgICJjb3VudHJ5IjogeyJ0eXBlIjogInN0cmluZyIsICJ0aXRsZSI6ICJjb3VudHJ5In0sCiAgICAgICAgIm1pblVuaXRzIjogeyJ0eXBlIjogIm51bWJlciIsICJ0aXRsZSI6ICJtaW4gdW5pdHMifSwKICAgICAgICAiYmlsbGluZ0ludGVydmFsIjogeyJ0eXBlIjogIm51bWJlciIsICJ0aXRsZSI6ICJiaWxsaW5nIGludGVydmFsIn0sCiAgICAgICAgIm1heEJpbGxpbmdVbml0TGFnIjogeyJ0eXBlIjogIm51bWJlciIsICJ0aXRsZSI6ICJtYXggYmlsbGluZyB1bml0IGxhZyJ9LAogICAgICAgICJmcmVlVW5pdHMiOiB7InR5cGUiOiAibnVtYmVyIiwgInRpdGxlIjogImZyZWUgdW5pdHMifSwKICAgICAgICAidGVtcGxhdGUiOiB7InR5cGUiOiAic3RyaW5nIiwgImRlZmF1bHQiOiAiMSJ9LAogICAgICAgICJwcm9kdWN0IjogeyJ0eXBlIjogInN0cmluZyIsICJkZWZhdWx0IjogIjEifSwKICAgICAgICAiYWdlbnQiOiB7InR5cGUiOiAic3RyaW5nIiwgInRpdGxlIjogImFnZW50IHV1aWQifSwKICAgICAgICAiYWRkaXRpb25hbFBhcmFtcyI6IHsidHlwZSI6ICJzdHJpbmciLCAiZGVmYXVsdCI6ICJ7fSJ9LAogICAgICAgICJtYXhTdXNwZW5kVGltZSI6IHsidHlwZSI6ICJudW1iZXIiLCAidGl0bGUiOiAibWF4IHN1c3BlbmQgdGltZSJ9CiAgICAgIH0KICAgIH0sCiAgICAidWlTY2hlbWEiOiB7CiAgICAgICAgInNlcnZpY2VOYW1lIjogeyJ1aTpoZWxwIjogImVudGVyIG5hbWUgb2Ygc2VydmljZSJ9LAogICAgICAgICJzdXBwbHkiOiB7InVpOmhlbHAiOiAiTWF4aW11bSBzdXBwbHkgb2Ygc2VydmljZXMgYWNjb3JkaW5nIHRvIHNlcnZpY2Ugb2ZmZXJpbmdzLiBJdCByZXByZXNlbnRzIG1heGltdW0gbnVtYmVyIG9mIGNsaWVudHMgdGhhdCBjYW4gY29uc3VtZSB0aGlzIHNlcnZpY2Ugb2ZmZXJpbmcgY29uY3VycmVudGx5LiJ9LAogICAgICAgICJ1bml0TmFtZSI6IHsidWk6aGVscCI6ICJNQi9NaW51dGVzIn0sCiAgICAgICAgInVuaXRUeXBlIjogeyJ1aTpoZWxwIjogInVuaXRzIG9yIHNlY29uZHMifSwKICAgICAgICAiYmlsbGluZ1R5cGUiOiB7InVpOmhlbHAiOiAicHJlcGFpZC9wb3N0cGFpZCJ9LAogICAgICAgICJzZXR1cFByaWNlIjogeyJ1aTpoZWxwIjogInNldHVwIGZlZSJ9LAogICAgICAgICJ1bml0UHJpY2UiOiB7InVpOmhlbHAiOiAiUFJJWCB0aGF0IG11c3QgYmUgcGFpZCBmb3IgdW5pdF9vZl9zZXJ2aWNlIn0sCiAgICAgICAgImNvdW50cnkiOiB7InVpOmhlbHAiOiAiQ291bnRyeSBvZiBzZXJ2aWNlIGVuZHBvaW50IGluIElTTyAzMTY2LTEgYWxwaGEtMiBmb3JtYXQuIn0sCiAgICAgICAgIm1pblVuaXRzIjogeyJ1aTpoZWxwIjogIlVzZWQgdG8gY2FsY3VsYXRlIG1pbmltdW0gZGVwb3NpdCByZXF1aXJlZCJ9LAogICAgICAgICJiaWxsaW5nSW50ZXJ2YWwiOiB7InVpOmhlbHAiOiAiU3BlY2lmaWVkIGluIHVuaXRfb2Zfc2VydmljZS4gUmVwcmVzZW50LCBob3cgb2Z0ZW4gQ2xpZW50IE1VU1QgcHJvdmlkZSBwYXltZW50IGFwcHJvdmFsIHRvIEFnZW50LiJ9LAogICAgICAgICJtYXhCaWxsaW5nVW5pdExhZyI6IHsidWk6aGVscCI6ICJNYXhpbXVtIHBheW1lbnQgbGFnIGluIHVuaXRzIGFmdGVyLCB3aGljaCBBZ2VudCB3aWxsIHN1c3BlbmQgc2VydmljZSB1c2FnZS4ifSwKICAgICAgICAiZnJlZVVuaXRzIjogeyJ1aTpoZWxwIjogIlVzZWQgdG8gZ2l2ZSBmcmVlIHRyaWFsLCBieSBzcGVjaWZ5aW5nIGhvdyBtYW55IGludGVydmFscyBjYW4gYmUgY29uc3VtZWQgd2l0aG91dCBwYXltZW50In0sCiAgICAgICAgInRlbXBsYXRlIjogeyJ1aTp3aWRnZXQiOiAiaGlkZGVuIn0sCiAgICAgICAgInByb2R1Y3QiOiB7InVpOndpZGdldCI6ICJoaWRkZW4ifSwKICAgICAgICAiYWdlbnQiOiB7InVpOndpZGdldCI6ICJoaWRkZW4ifSwKICAgICAgICAiYWRkaXRpb25hbFBhcmFtcyI6IHsidWk6d2lkZ2V0IjogImhpZGRlbiJ9LAogICAgICAgICJtYXhTdXNwZW5kVGltZSI6IHsidWk6aGVscCI6ICJNYXhpbXVtIHRpbWUgd2l0aG91dCBzZXJ2aWNlIHVzYWdlLiBBZ2VudCB3aWxsIGNvbnNpZGVyLCB0aGF0IENsaWVudCB3aWxsIG5vdCB1c2Ugc2VydmljZSBhbmQgc3RvcCBwcm92aWRpbmcgaXQuIFBlcmlvZCBpcyBzcGVjaWZpZWQgaW4gbWludXRlcy4ifQogICAgfQp9Cg==',
    kind: 'offer' } 
   ]}
   */
//   ,{endpoint: /\/offerings\?/, method: 'get', res: [{title: 'second offering', id: 2}, {title: 'third offering', id: 3}]}
//   ,{endpoint: /\/offerings\/\d+\/status/, method: 'get', res: {code: 200, status: 'OK!'}}
/*   ,{endpoint: /\/offerings/, method: 'get', res: [ { id: '9251aead-1e7e-4735-aa2e-04c925394ac4',
    is_local: true,
    template: '0815b4d3-f442-4c06-aff3-fbe868ed242a',
    product: '02c3fbff-37b5-4ad1-9e18-08f753cb1338',
    hash: '                                            ',
    status: 'unpublished',
    offerStatus: 'register',
    blockNumberUpdated: 750,
    agent: 'a5020d791fb405bd2d51        ',
    signature: 'signature text',
    serviceName: 'VPN Japan',
    description: 'description',
    country: 'RU',
    supply: 20,
    unitName: 'Mb',
    unitType: 'units',
    billingType: 'prepaid',
    setupPrice: 0,
    unitPrice: 10,
    minUnits: 20,
    maxUnit: 3,
    billingInterval: 3,
    maxBillingUnitLag: 3,
    maxSuspendTime: 600,
    maxInactiveTimeSec: 600,
    freeUnits: 1,
    nonce: '40802098-229d-46d6-9152-df67fb2cd131',
    additionalParams: 'e30=' } ]}
*/
/*
   ,{endpoint: /\/channels/, method: 'get', res: [ { id: 'f0e7bfa8-93f0-4127-8346-44f789eb471a',
    isLocal: false,
    agent: 'a5020d791fb405bd2           ',
    client: 'a5020d791fb405bd2           ',
    offering: '9251aead-1e7e-4735-aa2e-04c925394ac4',
    block: 792,
    channelStatus: 'active',
    serviceStatus: 'active',
    serviceChangedTime: '2018-05-04T04:58:39.252326+03:00',
    totalDeposit: 1000000 } ]}
   */
   ,{endpoint: /\/product\/.*\/status/, method: 'get', res: {code: 200, status: 'mocked!!!'}}
/*   ,{endpoint: /\/products/, method: 'get', res: [ { id: '02c3fbff-37b5-4ad1-9e18-08f753cb1338',
    name: 'DEVELOP PRODUCT',
    offerTplID: '0815b4d3-f442-4c06-aff3-fbe868ed242a',
    offerAccessID: '362acc10-6ef2-4339-839c-ff77ee213a62',
    usageRepType: 'total',
    isServer: true } ]}
   */
//   ,{endpoint: /\/endpoints/, method: 'get', res: {id: 17, src: '{"test_prop": "test_val"}'}}
   /*
   ,{endpoint: /\/settings/, method: 'get', res:[ { key: 'first setting',
    value: 'first value',
    description: 'first description' },
  { key: 'second setting',
    value: 'second value',
    description: 'second description' },
  { key: 'third setting',
    value: 'third value',
    description: 'third description' } ]}
   */
//   ,{endpoint: /\/channels\?/, method: 'get', res: [{title: 'second channel', id: 2}, {title: 'third channel', id: 3}]}
//   ,{endpoint: /\/channels/, method: 'get', res: [{title: 'first channel', id: 1}, {title: 'second channel', id: 2}, {title: 'third channel', id: 3}]}
/*   ,{endpoint: /\/sessions/, method: 'get', res: [ { id: '82f35bf5-ebab-4c63-9887-561548d78ca5',
    channel: 'f0e7bfa8-93f0-4127-8346-44f789eb471a',
    started: '2018-05-04T06:47:55.502453+03:00',
    stopped: '2018-05-04T06:47:55.502453+03:00',
    unitsUsed: 73,
    secondsConsumed: 368373,
    lastUsageTime: '2018-05-04T06:47:55.502453+03:00',
    serverIP: '192.168.0.1',
    serverPort: 443,
    clientIP: '127.0.0.1',
    clientPort: 8080 } ]}
   */
 //  ,{endpoint: /\/products/, method: 'get', res: [{title: 'first product', id: 1}, {title: 'second product', id: 2}, {title: 'third product', id: 3}]}

];

export default {
    has: function(req: any){
        const is = mock => mock.endpoint.test(req.endpoint) && req.options.method.toLowerCase() === mock.method.toLowerCase();
        return mocks.some(is);
    },
    get: function(req: any){
        const is = mock => mock.endpoint.test(req.endpoint) && req.options.method.toLowerCase() === mock.method.toLowerCase();
        const res = mocks.map(mock => is(mock) ? mock.res : undefined ).filter(res => res);
        if(res.length < 1){
            console.log('have no response for request: ', req);
            process.exit(1);
        }
        return res[0];
    }
};
