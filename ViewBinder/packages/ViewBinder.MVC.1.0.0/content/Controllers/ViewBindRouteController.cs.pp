using System.Web.Mvc;
namespace $rootnamespace$.Controllers
{
    public class ViewBindRouteController : Controller
    {
        /// <summary>
        /// This returns views requested via ajax
        /// and can also return views as whole page
        /// </summary>
        /// <param name="viewName"></param>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Get(string viewName)
        {
            if (Request.IsAjaxRequest())
            {
                return PartialView("~/Views/Partials/" + viewName + ".cshtml");
            }
            return View("~/Views/Partials/" + viewName + ".cshtml");
        }
    }
}