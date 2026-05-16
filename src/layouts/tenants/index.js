import { useState, useEffect, useCallback } from "react";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Swal from "sweetalert2";

const COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];
const avatarColor = (n) => { let h=0; for(let c of (n||"")) h=c.charCodeAt(0)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; };
const initials = (n) => n ? n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : "?";
const isExpired = (d) => new Date(d) < new Date();
const expiringSoon = (d) => { const diff=new Date(d)-new Date(); return diff>0&&diff<30*24*60*60*1000; };

const TH = ({ icon, children }) => (
  <th style={{ padding:"13px 16px", textAlign:"left", fontWeight:700, fontSize:"0.68rem",
    textTransform:"uppercase", letterSpacing:"0.07em", color:"#ffffff",
    borderBottom:"2px solid #0f172a", background:"#1e293b", whiteSpace:"nowrap" }}>
    <span style={{ display:"flex", alignItems:"center", gap:5 }}>
      {icon && <span className="material-icons" style={{ fontSize:13, color:"#94a3b8" }}>{icon}</span>}
      {children}
    </span>
  </th>
);

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ companyName:"",email:"",password:"",planName:"1-Year",expiryDate:"",gstNumber:"",address:"",phone:"",companyLogo:null,logoPreview:"" });
  const [showFormPw, setShowFormPw] = useState(false);
  const [visiblePws, setVisiblePws] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchTenants = useCallback(async () => {
    try {
      const res = await fetch("https://backend-1-vxvg.onrender.com/api/auth/tenants", { headers: { "Authorization": `Bearer ${user.token}` } });
      setTenants(await res.json());
    } catch(e){ console.error(e); }
  }, [user.token]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const handleSave = async () => {
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if(k==="companyLogo"&&form[k]) fd.append(k,form[k]);
        else if(k!=="logoPreview"&&k!=="companyLogo") fd.append(k,form[k]);
      });
      const res = await fetch(
        editId ? `https://backend-1-vxvg.onrender.com/api/auth/tenants/${editId}` : "https://backend-1-vxvg.onrender.com/api/auth/register-tenant",
        { method:editId?"PUT":"POST", headers:{"Authorization":`Bearer ${user.token}`}, body:fd }
      );
      if(res.ok) {
        Swal.fire("Success", editId?"Tenant Updated!":"Tenant Registered!","success");
        setShowAdd(false); setEditId(null);
        setForm({companyName:"",email:"",password:"",planName:"1-Year",expiryDate:"",gstNumber:"",address:"",phone:"",companyLogo:null,logoPreview:""});
        fetchTenants();
      } else { const e=await res.json(); Swal.fire("Error",e.message,"error"); }
    } catch { Swal.fire("Error","Server error","error"); }
  };

  const handleEdit = (t) => {
    setEditId(t._id);
    setForm({ companyName:t.companyName||"",email:t.email||"",password:"",planName:t.planName||"1-Year",
      expiryDate:t.expiryDate?new Date(t.expiryDate).toISOString().split("T")[0]:"",
      gstNumber:t.gstNumber||"",address:t.address||"",phone:t.phone||"",logoPreview:t.companyLogo||"" });
    setShowAdd(true);
  };

  const toggleStatus = async (id, cur) => {
    const next = cur==="Active"?"Inactive":"Active";
    try {
      await fetch(`https://backend-1-vxvg.onrender.com/api/auth/tenants/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json","Authorization":`Bearer ${user.token}`},
        body:JSON.stringify({status:next})
      });
      Swal.fire("Updated",`Tenant is now ${next}`,"success"); fetchTenants();
    } catch { Swal.fire("Error","Could not update","error"); }
  };

  const filtered = tenants.filter(t =>
    (t.companyName?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus==="All" || t.status===filterStatus)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const planColors = { "1-Year":["#1d4ed8","#eff6ff","#bfdbfe"], "2-Year":["#15803d","#f0fdf4","#bbf7d0"], "Custom":["#7e22ce","#faf5ff","#e9d5ff"] };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={4}>

        {/* Header */}
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
          <MDBox>
            <MDTypography variant="h3" fontWeight="bold" sx={{ color:"#0f172a", letterSpacing:"-0.8px" }}>Tenant Management</MDTypography>
            <MDTypography variant="body2" sx={{ color:"#94a3b8", mt:0.5 }}>Manage all registered tenants, plans &amp; access</MDTypography>
          </MDBox>
          <MDButton onClick={()=>{setShowAdd(!showAdd);if(showAdd)setEditId(null);}} sx={{
            background: showAdd?"#f1f5f9":"linear-gradient(135deg,#6366f1,#4f46e5)",
            color:showAdd?"#475569":"#fff", borderRadius:"12px", px:3, py:1.2, fontWeight:700,
            boxShadow:showAdd?"none":"0 6px 20px rgba(99,102,241,0.4)",
            "&:hover":{ background:showAdd?"#e2e8f0":"linear-gradient(135deg,#818cf8,#6366f1)", boxShadow:"none" }
          }}>
            <Icon sx={{ fontSize:"18px !important", mr:0.8 }}>{showAdd?"close":"add_business"}</Icon>
            {showAdd?"Cancel":"Add New Tenant"}
          </MDButton>
        </MDBox>

        {/* Stat strip */}
        <MDBox display="flex" gap={2} mb={3} flexWrap="wrap">
          {[
            { label:"Total", value:tenants.length, color:"#6366f1", bg:"#eef2ff", icon:"groups" },
            { label:"Active", value:tenants.filter(t=>t.status==="Active").length, color:"#10b981", bg:"#ecfdf5", icon:"check_circle" },
            { label:"Expiring Soon", value:tenants.filter(t=>expiringSoon(t.expiryDate)).length, color:"#f59e0b", bg:"#fffbeb", icon:"warning" },
            { label:"Expired", value:tenants.filter(t=>isExpired(t.expiryDate)).length, color:"#ef4444", bg:"#fef2f2", icon:"cancel" },
          ].map(s=>(
            <MDBox key={s.label} sx={{ display:"flex",alignItems:"center",gap:1.5,px:2.5,py:1.8,
              borderRadius:"14px",bgcolor:s.bg,border:`1px solid ${s.color}22`,flex:1,minWidth:130 }}>
              <Icon sx={{ color:s.color, fontSize:"22px !important" }}>{s.icon}</Icon>
              <MDBox>
                <MDTypography variant="h5" fontWeight="bold" sx={{ color:"#0f172a",lineHeight:1 }}>{s.value}</MDTypography>
                <MDTypography variant="caption" sx={{ color:s.color, fontWeight:600 }}>{s.label}</MDTypography>
              </MDBox>
            </MDBox>
          ))}
        </MDBox>

        {/* Add/Edit Form */}
        {showAdd && (
          <Card sx={{ mb:3, borderRadius:"18px", overflow:"hidden", boxShadow:"0 8px 32px rgba(99,102,241,0.12)", border:"1px solid #e0e7ff" }}>
            <MDBox sx={{ px:3,py:2,background:"linear-gradient(135deg,#6366f1,#4f46e5)",display:"flex",alignItems:"center",gap:1.5 }}>
              <Icon sx={{ color:"#c7d2fe",fontSize:"20px !important" }}>{editId?"edit":"add_business"}</Icon>
              <MDTypography variant="h6" fontWeight="bold" sx={{ color:"#fff" }}>{editId?"Edit Tenant":"Register New Tenant"}</MDTypography>
            </MDBox>
            <MDBox p={3}>
              <MDBox display="grid" gridTemplateColumns="repeat(2,1fr)" gap={2.5}>
                <MDInput label="Company Name" fullWidth value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})} />
                <MDInput label="Email" fullWidth value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
                <MDInput label="Password" fullWidth type={showFormPw?"text":"password"}
                  placeholder={editId?"(Leave blank to keep same)":""} value={form.password}
                  onChange={e=>setForm({...form,password:e.target.value})}
                  InputProps={{ endAdornment:(
                    <InputAdornment position="end">
                      <IconButton onClick={()=>setShowFormPw(!showFormPw)} edge="end">
                        <Icon sx={{ fontSize:"18px !important" }}>{showFormPw?"visibility":"visibility_off"}</Icon>
                      </IconButton>
                    </InputAdornment>
                  )}} />
                <MDInput label="GST Number" fullWidth value={form.gstNumber} onChange={e=>setForm({...form,gstNumber:e.target.value})} />
                <MDInput label="Phone" fullWidth value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                <MDInput label="Expiry Date" type="date" focused fullWidth value={form.expiryDate} onChange={e=>setForm({...form,expiryDate:e.target.value})} />
                <MDInput label="Address" multiline rows={2} fullWidth value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
                <MDBox>
                  <MDTypography variant="caption" fontWeight="bold" sx={{ color:"#475569",mb:1,display:"block",textTransform:"uppercase",letterSpacing:"0.06em",fontSize:"0.67rem" }}>Company Logo</MDTypography>
                  <input type="file" accept="image/*" style={{ fontSize:"0.82rem" }} onChange={e=>{ const f=e.target.files[0]; if(f) setForm({...form,companyLogo:f,logoPreview:URL.createObjectURL(f)}); }} />
                  {form.logoPreview && <img src={form.logoPreview} alt="preview" style={{ width:52,height:52,marginTop:8,borderRadius:10,objectFit:"cover",border:"2px solid #e0e7ff" }} />}
                </MDBox>
              </MDBox>
              <MDBox mt={3} display="flex" gap={2}>
                <MDButton onClick={handleSave} sx={{ background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",borderRadius:"10px",px:3.5,fontWeight:700,"&:hover":{background:"linear-gradient(135deg,#34d399,#10b981)"} }}>
                  <Icon sx={{ mr:0.8,fontSize:"16px !important" }}>{editId?"save":"person_add"}</Icon>
                  {editId?"Update Tenant":"Register Tenant"}
                </MDButton>
                {editId && <MDButton variant="outlined" onClick={()=>{setEditId(null);setShowAdd(false);}}
                  sx={{ borderRadius:"10px",px:3,fontWeight:700,borderColor:"#e2e8f0",color:"#64748b","&:hover":{bgcolor:"#f8fafc"} }}>Cancel</MDButton>}
              </MDBox>
            </MDBox>
          </Card>
        )}

        {/* Table Card */}
        <Card sx={{ borderRadius:"18px", overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.07)", border:"1px solid #f1f5f9" }}>

          {/* Toolbar */}
          <MDBox sx={{ px:3,py:2.2, background:"linear-gradient(135deg,#0f172a,#1e293b)", display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:2 }}>
            <MDBox>
              <MDTypography variant="h6" fontWeight="bold" sx={{ color:"#f8fafc",letterSpacing:"-0.3px" }}>All Tenants</MDTypography>
              <MDTypography variant="caption" sx={{ color:"#64748b" }}>{filtered.length} result{filtered.length!==1?"s":""}</MDTypography>
            </MDBox>
            <MDBox display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
              {["All","Active","Inactive"].map(s=>(
                <MDBox key={s} onClick={()=>{setFilterStatus(s);setPage(1);}} sx={{
                  px:2,py:0.6,borderRadius:"20px",cursor:"pointer",fontWeight:700,fontSize:"0.78rem",
                  bgcolor:filterStatus===s?(s==="Active"?"#10b981":s==="Inactive"?"#ef4444":"#6366f1"):"rgba(255,255,255,0.08)",
                  color:filterStatus===s?"#fff":"#94a3b8",
                  border:`1px solid ${filterStatus===s?"transparent":"rgba(255,255,255,0.1)"}`,
                  transition:"all 0.2s"
                }}>{s}</MDBox>
              ))}
              <MDBox sx={{ position:"relative" }}>
                <Icon sx={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#64748b",fontSize:"16px !important" }}>search</Icon>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
                  style={{ padding:"7px 12px 7px 30px",borderRadius:"10px",border:"1px solid rgba(255,255,255,0.12)",
                    background:"rgba(255,255,255,0.06)",color:"#f1f5f9",fontSize:"0.82rem",outline:"none",width:170,boxSizing:"border-box" }} />
              </MDBox>
            </MDBox>
          </MDBox>

          {/* Table */}
          <MDBox sx={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  <TH icon="business">Company</TH>
                  <TH icon="email">Email</TH>
                  <TH icon="phone">Phone</TH>
                  <TH icon="lock">Password</TH>
                  <TH icon="verified">Status</TH>
                  <TH icon="event">Expiry</TH>
                  <TH icon="settings">Actions</TH>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign:"center", padding:"60px 20px", color:"#94a3b8" }}>
                      <span className="material-icons" style={{ fontSize:40,display:"block",marginBottom:8,color:"#e2e8f0" }}>business_center</span>
                      No tenants found
                    </td>
                  </tr>
                ) : paginated.map((t, idx) => {
                  const ac = avatarColor(t.companyName);
                  const exp = isExpired(t.expiryDate);
                  const soon = expiringSoon(t.expiryDate);
                  const [pc,pbg,pbr] = planColors[t.planName]||planColors["Custom"];
                  return (
                    <tr key={t._id} style={{ background: idx%2===0?"#ffffff":"#fafbff", borderBottom:"1px solid #f1f5f9", transition:"background 0.15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f0f4ff"}
                      onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?"#ffffff":"#fafbff"}>

                      {/* Company */}
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          {t.companyLogo ? (
                            <img src={t.companyLogo} alt="logo" style={{ width:42,height:42,borderRadius:12,objectFit:"cover",border:"2px solid #f1f5f9",flexShrink:0 }} />
                          ) : (
                            <div style={{ width:42,height:42,borderRadius:12,flexShrink:0,
                              background:`linear-gradient(135deg,${ac},${ac}bb)`,
                              display:"flex",alignItems:"center",justifyContent:"center",
                              color:"#fff",fontWeight:800,fontSize:"0.85rem",
                              boxShadow:`0 4px 10px ${ac}44` }}>
                              {initials(t.companyName)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight:700,fontSize:"0.88rem",color:"#0f172a",lineHeight:1.3 }}>{t.companyName}</div>
                            <span style={{ display:"inline-flex",alignItems:"center",gap:4,marginTop:3,
                              padding:"2px 8px",borderRadius:20,background:pbg,border:`1px solid ${pbr}` }}>
                              <span className="material-icons" style={{ fontSize:10,color:pc }}>workspace_premium</span>
                              <span style={{ fontSize:"0.65rem",fontWeight:700,color:pc }}>{t.planName}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding:"14px 16px" }}>
                        <span style={{ fontSize:"0.82rem",color:"#0f172a",fontFamily:"monospace",fontWeight:600 }}>{t.email}</span>
                      </td>

                      {/* Phone */}
                      <td style={{ padding:"14px 16px" }}>
                        {t.phone ? (
                          <span style={{ display:"inline-flex",alignItems:"center",gap:5,
                            padding:"4px 10px",borderRadius:8,background:"#f0f9ff",border:"1px solid #bae6fd" }}>
                            <span className="material-icons" style={{ fontSize:13,color:"#0284c7" }}>phone</span>
                            <span style={{ fontSize:"0.78rem",fontWeight:700,color:"#0f172a" }}>{t.phone}</span>
                          </span>
                        ) : <span style={{ color:"#cbd5e1",fontSize:"0.8rem" }}>—</span>}
                      </td>

                      {/* Password */}
                      <td style={{ padding:"14px 16px", maxWidth:160 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:6,
                          padding:"5px 10px",borderRadius:8,background:"#f8fafc",border:"1px solid #f1f5f9",
                          maxWidth:"100%",overflow:"hidden" }}>
                          <span style={{ fontFamily:"monospace",letterSpacing:visiblePws[t._id]?"0px":"2px",fontSize:"0.75rem",
                            color:"#0f172a",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",
                            whiteSpace:"nowrap",maxWidth:100,display:"block",flexShrink:1 }}>
                            {visiblePws[t._id] ? t.password : "••••••••"}
                          </span>
                          <Tooltip title={visiblePws[t._id]?"Hide":"Show"}>
                            <IconButton size="small" onClick={()=>setVisiblePws(p=>({...p,[t._id]:!p[t._id]}))} sx={{ p:"2px",flexShrink:0 }}>
                              <Icon sx={{ fontSize:"14px !important",color:"#94a3b8" }}>{visiblePws[t._id]?"visibility":"visibility_off"}</Icon>
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding:"14px 16px" }}>
                        <span style={{ display:"inline-flex",alignItems:"center",gap:6,
                          padding:"5px 12px",borderRadius:20,
                          background:t.status==="Active"?"#f0fdf4":"#fff1f2",
                          border:`1px solid ${t.status==="Active"?"#bbf7d0":"#fecaca"}` }}>
                          <span style={{ width:7,height:7,borderRadius:"50%",flexShrink:0,
                            background:t.status==="Active"?"#22c55e":"#f87171" }} />
                          <span style={{ fontSize:"0.75rem",fontWeight:700,color:t.status==="Active"?"#15803d":"#b91c1c" }}>
                            {t.status}
                          </span>
                        </span>
                      </td>

                      {/* Expiry */}
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ fontSize:"0.8rem",fontWeight:600,color:exp?"#b91c1c":soon?"#d97706":"#334155" }}>
                          {new Date(t.expiryDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
                        </div>
                        {exp && <div style={{ fontSize:"0.65rem",color:"#ef4444",fontWeight:700,marginTop:2 }}>⚠ Expired</div>}
                        {soon && !exp && <div style={{ fontSize:"0.65rem",color:"#f59e0b",fontWeight:700,marginTop:2 }}>⚡ Expiring soon</div>}
                      </td>

                      {/* Actions */}
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", gap:8 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={()=>handleEdit(t)} sx={{ bgcolor:"#eff6ff",borderRadius:"8px",p:"7px","&:hover":{bgcolor:"#dbeafe",transform:"scale(1.1)"},transition:"all 0.15s" }}>
                              <Icon sx={{ fontSize:"15px !important",color:"#2563eb" }}>edit</Icon>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t.status==="Active"?"Deactivate":"Activate"}>
                            <IconButton size="small" onClick={()=>toggleStatus(t._id,t.status)}
                              sx={{ bgcolor:t.status==="Active"?"#fff1f2":"#f0fdf4",borderRadius:"8px",p:"7px",
                                "&:hover":{bgcolor:t.status==="Active"?"#ffe4e6":"#dcfce7",transform:"scale(1.1)"},transition:"all 0.15s" }}>
                              <Icon sx={{ fontSize:"15px !important",color:t.status==="Active"?"#e11d48":"#16a34a" }}>
                                {t.status==="Active"?"block":"check_circle"}
                              </Icon>
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </MDBox>

          {/* Footer / Pagination */}
          {filtered.length > 0 && (
            <MDBox sx={{ px:3,py:1.8,bgcolor:"#f8fafc",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:2 }}>
              <MDTypography variant="caption" sx={{ color:"#0f172a",fontWeight:600 }}>
                Showing <strong style={{color:"#000"}}>{Math.min((page-1)*rowsPerPage+1, filtered.length)}</strong>–<strong style={{color:"#000"}}>{Math.min(page*rowsPerPage, filtered.length)}</strong> of <strong style={{color:"#000"}}>{filtered.length}</strong> tenants
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={0.8}>
                <IconButton size="small" disabled={page===1} onClick={()=>setPage(1)}
                  sx={{ bgcolor:"#f1f5f9",borderRadius:"8px",p:"5px","&:disabled":{opacity:0.35} }}>
                  <Icon sx={{ fontSize:"15px !important" }}>first_page</Icon>
                </IconButton>
                <IconButton size="small" disabled={page===1} onClick={()=>setPage(p=>p-1)}
                  sx={{ bgcolor:"#f1f5f9",borderRadius:"8px",p:"5px","&:disabled":{opacity:0.35} }}>
                  <Icon sx={{ fontSize:"15px !important" }}>chevron_left</Icon>
                </IconButton>
                {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                  <MDBox key={p} onClick={()=>setPage(p)} sx={{
                    width:32,height:32,borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",
                    cursor:"pointer",fontWeight:700,fontSize:"0.82rem",
                    bgcolor:page===p?"#6366f1":"#f1f5f9",
                    color:page===p?"#fff":"#0f172a",
                    boxShadow:page===p?"0 4px 10px rgba(99,102,241,0.4)":"none",
                    transition:"all 0.15s"
                  }}>{p}</MDBox>
                ))}
                <IconButton size="small" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}
                  sx={{ bgcolor:"#f1f5f9",borderRadius:"8px",p:"5px","&:disabled":{opacity:0.35} }}>
                  <Icon sx={{ fontSize:"15px !important" }}>chevron_right</Icon>
                </IconButton>
                <IconButton size="small" disabled={page===totalPages} onClick={()=>setPage(totalPages)}
                  sx={{ bgcolor:"#f1f5f9",borderRadius:"8px",p:"5px","&:disabled":{opacity:0.35} }}>
                  <Icon sx={{ fontSize:"15px !important" }}>last_page</Icon>
                </IconButton>
              </MDBox>
            </MDBox>
          )}
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tenants;
